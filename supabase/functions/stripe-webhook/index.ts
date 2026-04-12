import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
    )

    console.log(`🔔 Recebido evento: ${event.type}`)

    if (event.type === "checkout.session.completed" || event.type === "customer.subscription.updated") {
      const session = event.data.object
      const userId = session.client_reference_id || session.metadata?.userId || session.subscription_data?.metadata?.userId
      const customerId = session.customer
      const subscriptionId = session.subscription || session.id

      console.log(`🔍 Processando ${event.type} para Usuário: ${userId}, Cliente: ${customerId}`)

      // Get subscription details to find end date and cancellation status
      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)
      
      const updateData: any = {
        subscription_status: subscription.status === 'active' ? 'active' : 'trial',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plan_type: subscription.items.data[0].plan.id,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        is_first_purchase: false
      }

      // If we don't have a userId, we MUST find it by customerId to avoid orphaned payments
      let targetProfileId = userId
      if (!targetProfileId && customerId) {
        const { data: customerProfile } = await supabaseAdmin.from("profiles").select("id").eq("stripe_customer_id", customerId).single()
        targetProfileId = customerProfile?.id
      }

      if (targetProfileId) {
        console.log(`📝 Atualizando perfil: ${targetProfileId}`)
        const { data: profileBeforeUpdate } = await supabaseAdmin.from("profiles").select("affiliate_id").eq("id", targetProfileId).single()
        
        const { error } = await supabaseAdmin.from("profiles").update(updateData).eq("id", targetProfileId)
        if (error) console.error(`❌ Erro ao atualizar perfil: ${error.message}`)

        // --- AFFILIATE COMMISSION LOGIC ---
        const affiliateId = profileBeforeUpdate?.affiliate_id
        if (affiliateId && session.amount_total) {
          console.log(`💰 Processando comissão para Afiliado: ${affiliateId}`)
          
          // Get affiliate's commission rate (using their affiliate_discount field)
          const { data: affiliateProfile } = await supabaseAdmin
            .from("profiles")
            .select("affiliate_discount, affiliate_balance")
            .eq("id", affiliateId)
            .single()

          const commissionPercent = affiliateProfile?.affiliate_discount || 10
          const amountTotal = (session as any).amount_total / 100 // Convert cents to decimal
          const commissionAmount = amountTotal * (commissionPercent / 100)

          if (commissionAmount > 0) {
            const { error: commissionError } = await supabaseAdmin
              .from("profiles")
              .update({ 
                affiliate_balance: (Number(affiliateProfile?.affiliate_balance || 0) + commissionAmount).toFixed(2) 
              })
              .eq("id", affiliateId)

            if (commissionError) {
              console.error(`❌ Erro ao creditar comissão: ${commissionError.message}`)
            } else {
              console.log(`✅ Comissão de R$ ${commissionAmount.toFixed(2)} creditada ao afiliado.`)
            }
          }
        }
      }

      console.log(`✅ Assinatura processada com sucesso: ${subscriptionId}`)
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "expired",
          cancel_at_period_end: false
        })
        .eq("stripe_subscription_id", subscription.id)

      console.log(`❌ Assinatura excluída: ${subscription.id}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error(`❌ Erro no webhook: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
