import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, Zap, Clock, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';

export const ConversionView = () => {
  const { user, signOut } = useAuth();
  const hasCoupon = !!user?.profile?.affiliate_id;

  const plans = [
    {
      id: 'monthly',
      name: 'Mensal',
      price: 59.62,
      discountPrice: 53.66,
      priceId: 'price_1TLPDZDbUw3ACMsAFMeTwJ8q',
      period: 'mês',
      description: 'Ideal para quem está começando agora.'
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      price: 89.68,
      discountPrice: 80.71,
      priceId: 'price_1TLPDaDbUw3ACMsAwaiZMwW5',
      period: 'trimestre',
      starred: true,
      description: 'A escolha da maioria dos traders consistentes.'
    },
    {
      id: 'semi-annual',
      name: 'Semestral',
      price: 119.74,
      discountPrice: 107.77,
      priceId: 'price_1TLPDaDbUw3ACMsAEjCiKZzh',
      period: 'semestre',
      description: 'Máxima performance com o melhor custo-benefício.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-4xl w-full text-center mb-12">
        <div className="inline-flex p-4 bg-red-500/10 rounded-3xl text-red-500 mb-6">
          <Clock size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Seu acesso expirou.</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Continue evoluindo seu trading sem perder seus dados, histórico e estatísticas. Escolha o melhor plano para você.
        </p>
        
        {hasCoupon ? (
          <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500 font-bold text-sm animate-bounce">
            <Zap size={18} fill="currentColor" />
            Cupom de 10% OFF aplicado automaticamente via afiliado!
          </div>
        ) : (
          <div className="mt-8 inline-flex flex-col items-center gap-2">
            <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl text-primary font-black text-sm">
              Use o cupom <span className="text-foreground underline underline-offset-4 decoration-2">TRADINGBLACK</span> para liberar 10% de desconto agora!
            </div>
            <p className="text-xs text-muted-foreground">O desconto será aplicado no carrinho de pagamento.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full px-6 mb-12">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            hasCoupon={hasCoupon} 
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          <ShieldCheck size={48} className="text-muted-foreground" />
          <div className="text-left">
            <p className="text-sm font-bold">Pagamento 100% Seguro</p>
            <p className="text-xs">Criptografia de ponta a ponta e processamento rápido.</p>
          </div>
        </div>
        
        <button 
          onClick={signOut}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, hasCoupon }) => {
  const { subscribe } = useAuth();
  const displayPrice = hasCoupon ? plan.discountPrice : plan.price;
  const originalPrice = plan.price;

  return (
    <div 
      onClick={() => subscribe(plan.priceId, hasCoupon)}
      className={`relative bg-card border ${plan.starred ? 'border-primary shadow-2xl shadow-primary/20 scale-105 z-10' : 'border-border shadow-md'} p-8 rounded-4xl flex flex-col h-full hover:border-primary/50 transition-all group cursor-pointer`}>
      {plan.starred && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
          Mais Recomendado
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="mb-8 p-6 bg-muted/30 rounded-4xl border border-border/50">
        {hasCoupon && (
          <div className="text-sm text-muted-foreground line-through font-bold mb-1">
            R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black">R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          <span className="text-muted-foreground text-sm font-bold">/{plan.period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-10 flex-1">
        <Benefit text="Acesso completo ao Dashboard" />
        <Benefit text="Relatórios de Performance" />
        <Benefit text="Alertas de Mesa Proprietária" />
        <Benefit text="Suporte Prioritário 24/7" />
        <Benefit text="Análise de múltiplos ativos" />
      </ul>

      <button className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] ${
        plan.starred 
          ? 'bg-primary text-white shadow-primary/30' 
          : 'bg-foreground text-background shadow-foreground/20'
      }`}>
        Assinar Agora
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

const Benefit = ({ text }) => (
  <li className="flex items-center gap-3 text-sm font-medium">
    <div className="bg-primary/10 p-1 rounded-full text-primary">
      <Check size={14} />
    </div>
    {text}
  </li>
);
