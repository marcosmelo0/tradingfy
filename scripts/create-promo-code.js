import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createPromotionCode() {
  try {
    // Primeiro, garantimos que o Cupom existe (já deve existir)
    // Depois criamos o Código de Promoção associado a ele
    const promoCode = await stripe.promotionCodes.create({
      coupon: 'TRADINGBLACK',
      code: 'TRADINGBLACK',
    });
    console.log(`✅ Código de Promoção criado: ${promoCode.code}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ O código de promoção TRADINGBLACK já existe.');
    } else {
      console.error('❌ Erro ao criar código de promoção:', error.message);
    }
  }
}

createPromotionCode();
