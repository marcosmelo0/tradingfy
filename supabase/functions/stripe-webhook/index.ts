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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const userId = session.metadata.userId
      const customerId = session.customer
      const subscriptionId = session.subscription

      // Get subscription details to find end date
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_type: subscription.items.data[0].plan.id, // Or map price ID to your names
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          is_first_purchase: false
        })
        .eq("id", userId)

      if (error) throw error
      console.log(`✅ Assinatura ativada para o usuário: ${userId}`)
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscription_status: "expired", // Or 'inactive'
        })
        .eq("stripe_subscription_id", subscription.id)

      if (error) throw error
      console.log(`❌ Assinatura cancelada/expirada: ${subscription.id}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error(`❌ Erro no webhook: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
