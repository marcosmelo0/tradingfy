import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    name: 'Mensal - TradingFy',
    description: 'Acesso total mensal ao TradingFy',
    amount: 5962, // R$ 59,62
    interval: 'month',
    interval_count: 1,
  },
  {
    name: 'Trimestral - TradingFy',
    description: 'Acesso total trimestral ao TradingFy',
    amount: 8968, // R$ 89,68
    interval: 'month',
    interval_count: 3,
  },
  {
    name: 'Semestral - TradingFy',
    description: 'Acesso total semestral ao TradingFy',
    amount: 11974, // R$ 119,74
    interval: 'month',
    interval_count: 6,
  }
];

async function setup() {
  console.log('🚀 Iniciando criação de produtos no Stripe...');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Erro: STRIPE_SECRET_KEY não encontrada no .env');
    return;
  }

  for (const plan of plans) {
    try {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
      });

      const price = await stripe.prices.create({
        unit_amount: plan.amount,
        currency: 'brl',
        recurring: {
          interval: plan.interval,
          interval_count: plan.interval_count,
        },
        product: product.id,
      });

      console.log(`✅ Criado: ${plan.name}`);
      console.log(`   ID do Preço: ${price.id}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${plan.name}:`, error.message);
    }
  }
}

setup();
