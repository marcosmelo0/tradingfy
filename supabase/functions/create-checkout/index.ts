import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization")
    
    // Log detalhado para depuração (Remova em produção)
    console.log("📥 Requisição recebida. Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())))
    console.log(`🔑 Auth Header presente: ${!!authHeader}`)

    if (!authHeader) {
      console.error("❌ Cabeçalho de autorização ausente.")
      throw new Error("Missing Authorization header")
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error("❌ Falha ao validar usuário:", userError?.message || "Usuário não encontrado")
      return new Response(JSON.stringify({ error: "Unauthorized: " + (userError?.message || "Invalid token") }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      })
    }

    console.log(`✅ Checkout iniciado por: ${user.email}`)

    const { priceId, hasAffiliate } = await req.json()

    // Admin client to look up affiliate data (avoids 403 errors)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    // Get current profile for metadata
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // NEW: Look up the actual coupon code of the affiliate
    let affiliateCoupon = "TRADING10" // Default fallback
    if (profile?.affiliate_id) {
      const { data: affiliateProfile } = await adminClient
        .from("profiles")
        .select("coupon_code")
        .eq("id", profile.affiliate_id)
        .single()
      
      if (affiliateProfile?.coupon_code) {
        affiliateCoupon = affiliateProfile.coupon_code
        console.log(`🎯 Usando cupom personalizado do afiliado: ${affiliateCoupon}`)
      }
    }

    let session;
    try {
      console.log(`💳 Tentando gerar checkout para ${priceId} (Cupom: ${hasAffiliate ? affiliateCoupon : 'Nenhum'})`)
      session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        client_reference_id: user.id,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        allow_promotion_codes: true,
        discounts: hasAffiliate ? [{ coupon: affiliateCoupon }] : [],
        success_url: `${req.headers.get("origin")}?success=true`,
        cancel_url: `${req.headers.get("origin")}?canceled=true`,
        metadata: {
          userId: user.id,
          affiliateId: profile?.affiliate_id || "",
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      })
    } catch (stripeError) {
      console.error("⚠️ Falha ao aplicar cupom ou criar sessão inicial:", stripeError.message)
      
      // Fallback: Tentativa final com o cupom global TRADING10 ou sem cupom
      const fallbackCoupon = affiliateCoupon !== "TRADING10" ? "TRADING10" : null;
      
      console.log(`🔄 Tentando checkout de fallback (Cupom: ${fallbackCoupon || 'Nenhum'})`)
      session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        client_reference_id: user.id,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        allow_promotion_codes: true,
        discounts: fallbackCoupon ? [{ coupon: fallbackCoupon }] : [],
        success_url: `${req.headers.get("origin")}?success=true`,
        cancel_url: `${req.headers.get("origin")}?canceled=true`,
        metadata: {
          userId: user.id,
          affiliateId: profile?.affiliate_id || "",
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      })
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
