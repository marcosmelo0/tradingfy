import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCoupon() {
  try {
    const coupon = await stripe.coupons.create({
      percent_off: 10,
      duration: 'forever',
      name: '10% OFF - TradingFy',
      id: 'TRADING10'
    });
    console.log(`✅ Cupom criado: ${coupon.id}`);
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('ℹ️ Cupom TRADING10 já existe.');
    } else {
      console.error('❌ Erro ao criar cupom:', error.message);
    }
  }
}

createCoupon();
