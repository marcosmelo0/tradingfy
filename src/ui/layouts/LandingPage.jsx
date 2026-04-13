import React, { useEffect, useState } from 'react';
import { Zap, CheckCircle2, Shield, BarChart3, ArrowRight, Star, Users, TrendingUp, Clock, Globe, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage = ({ onStartTrial, onLogin, onlyPricing = false }) => {
  const [ref, setRef] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user, subscribe } = useAuth();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const affiliateId = params.get('ref');
    if (affiliateId) {
      localStorage.setItem('tradingfy_affiliate', affiliateId);
      setRef(affiliateId);
    } else {
      setRef(localStorage.getItem('tradingfy_affiliate'));
    }
  }, []);

  const handleSubscribe = (priceId) => {
    if (user?.profile?.plan_type === priceId && user?.profile?.subscription_status === 'active') {
      return; // Já assinado
    }

    if (user) {
      subscribe(priceId, !!ref);
    } else {
      // Salva o plano escolhido para completar o checkout após o login
      localStorage.setItem('tradingfy_pending_plan', JSON.stringify({ 
        priceId, 
        hasAffiliate: !!ref 
      }));
      onStartTrial();
    }
  };

  const isCurrentPlan = (priceId) => user?.profile?.plan_type === priceId && user?.profile?.subscription_status === 'active';
  const getButtonLabel = (priceId, defaultLabel) => isCurrentPlan(priceId) ? 'Sua Assinatura' : defaultLabel;

  const PricingContent = () => (
    <div className="max-w-7xl mx-auto px-[5px] flex flex-col items-center">
      {!onlyPricing && (
        <div className="text-center mb-10 md:mb-16 w-full">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Planos que cabem no seu bolso</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">Escolha a melhor opção para a sua consistência.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl mx-auto place-items-stretch">
        {!ref && (
          <div className="md:col-span-3 w-full mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 px-2 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary font-black text-xs md:text-sm text-center w-full">
              <div className="flex items-center gap-2">
                <Zap size={16} fill="currentColor" className="animate-pulse" />
                <span>PROMOÇÃO: Use o cupom</span>
              </div>
              <span className="underline decoration-2 underline-offset-4 decoration-primary text-foreground bg-primary/5 px-2 py-1 rounded">TRADINGBLACK</span>
              <span>para 10% OFF hoje!</span>
            </div>
          </div>
        )}
        {/* Mensal */}
        <div 
          onClick={() => handleSubscribe('price_1TLUGnDbUw3ACMsAYQtdFUwG')}
          className="bg-card border border-border px-4 py-8 md:p-8 rounded-3xl md:rounded-4xl flex flex-col hover:border-primary/50 transition-all group cursor-pointer w-full"
        >
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">Mensal</h3>
            <div className="mb-6">
              {ref && (
                <div className="text-sm text-muted-foreground line-through opacity-50 mb-1">R$ 89,90</div>
              )}
              <span className="text-4xl font-black">{ref ? 'R$ 80,91' : 'R$ 89,90'}</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <Benefit text="Acesso Total ao Dashboard" />
            <Benefit text="Inteligência Analítica" />
            <Benefit text="Histórico Ilimitado" />
            <Benefit text="Calendário Econômico" />
            <Benefit text="Monitor de Risco" />
          </ul>
          <button 
            disabled={isCurrentPlan('price_1TLUGnDbUw3ACMsAYQtdFUwG')}
            className={`w-full py-4 rounded-xl font-black transition-all shadow-xl shadow-foreground/10 ${
              isCurrentPlan('price_1TLUGnDbUw3ACMsAYQtdFUwG') 
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' 
              : 'bg-foreground text-background hover:scale-105 cursor-pointer'
            }`}
          >
            {getButtonLabel('price_1TLUGnDbUw3ACMsAYQtdFUwG', 'Escolher Plano')}
          </button>
        </div>

        {/* Trimestral */}
        <div 
          onClick={() => handleSubscribe('price_1TLUGpDbUw3ACMsAbLAs6mB6')}
          className="bg-card border-2 border-primary px-4 py-8 md:p-8 rounded-3xl md:rounded-4xl flex flex-col relative shadow-2xl shadow-primary/10 md:scale-105 z-10 group cursor-pointer w-full my-4 md:my-0"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full whitespace-nowrap">
            MAIS POPULAR
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">Trimestral</h3>
            <div className="mb-6">
              {ref && (
                <div className="text-sm text-white/50 line-through mb-1">R$ 119,96</div>
              )}
              <span className="text-4xl font-black">{ref ? 'R$ 107,96' : 'R$ 119,96'}</span>
              <span className="text-muted-foreground">/trimestre</span>
              <div className="text-xs text-primary font-bold mt-1">Economia de 50% vs Mensal</div>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <Benefit text="Acesso Total ao Dashboard" />
            <Benefit text="Inteligência Analítica" />
            <Benefit text="Histórico Ilimitado" />
            <Benefit text="Calendário Econômico" />
            <Benefit text="Monitor de Risco" />
          </ul>
          <button 
            disabled={isCurrentPlan('price_1TLUGpDbUw3ACMsAbLAs6mB6')}
            className={`w-full py-4 rounded-xl font-black transition-all shadow-lg ${
              isCurrentPlan('price_1TLUGpDbUw3ACMsAbLAs6mB6')
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
              : 'bg-primary text-white shadow-primary/20 hover:scale-105 cursor-pointer'
            }`}
          >
            {getButtonLabel('price_1TLUGpDbUw3ACMsAbLAs6mB6', 'Assinar Agora')}
          </button>
        </div>

        {/* Semestral */}
        <div 
          onClick={() => handleSubscribe('price_1TLUGpDbUw3ACMsAl5oIwhM1')}
          className="bg-card border border-border px-3 py-8 md:p-8 rounded-3xl md:rounded-4xl flex flex-col hover:border-primary/50 transition-all group cursor-pointer w-full"
        >
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">Semestral</h3>
            <div className="mb-6">
              {ref && (
                <div className="text-sm text-muted-foreground line-through opacity-50 mb-1">R$ 150,02</div>
              )}
              <span className="text-4xl font-black">{ref ? 'R$ 135,02' : 'R$ 150,02'}</span>
              <span className="text-muted-foreground">/semestre</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <Benefit text="Acesso Total ao Dashboard" />
            <Benefit text="Inteligência Analítica" />
            <Benefit text="Histórico Ilimitado" />
            <Benefit text="Calendário Econômico" />
            <Benefit text="Monitor de Risco" />
          </ul>
          <button 
            disabled={isCurrentPlan('price_1TLUGpDbUw3ACMs Al5oIwhM1')}
            className={`w-full py-4 rounded-xl font-black transition-all shadow-xl shadow-foreground/10 ${
              isCurrentPlan('price_1TLUGpDbUw3ACMsAl5oIwhM1')
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
              : 'bg-foreground text-background hover:scale-105 cursor-pointer'
            }`}
          >
            {getButtonLabel('price_1TLUGpDbUw3ACMsAl5oIwhM1', 'Escolher Plano')}
          </button>
        </div>
      </div>
    </div>
  );

  if (onlyPricing) {
    return (
      <section className="py-12 px-6">
        <PricingContent />
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="bg-primary p-1.5 md:p-2 rounded-xl text-primary-foreground">
              <Zap size={20} className="md:w-6 md:h-6" fill="currentColor" />
            </div>
            <h1 className="text-lg md:text-2xl font-black tracking-tighter hidden min-[380px]:block">TradingFy</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            {!user && (
              <button 
                onClick={onLogin}
                className="text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1"
              >
                Entrar
              </button>
            )}
            <button 
              onClick={user ? () => window.location.href = '/dashboard' : onStartTrial}
              className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              {user ? 'Painel' : 'Experimentar'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-linear-to-b from-primary/10 via-transparent to-transparent -z-10 blur-3xl opacity-50" />
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Star size={14} fill="currentColor" />
            Votado #1 para Mesas Proprietárias
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Domine seu Trading com <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-500">Inteligência Profissional.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            A ferramenta definitiva para traders de mesa proprietária. Monitore métricas avançadas, analise seu comportamento e multiplique sua assertividade.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
            <button 
              onClick={user ? () => window.location.href = '/dashboard' : onStartTrial}
              className="w-full sm:w-auto bg-primary text-white text-base md:text-lg px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer group"
            >
              {user ? 'Acessar Painel' : 'Começar Trial de 7 Dias'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-sm font-medium text-muted-foreground">
              Sem cartão de crédito · Acesso completo
            </div>
          </div>
          
          {ref && (
            <div className="mt-8 text-sm font-bold text-primary flex items-center justify-center gap-2 animate-pulse">
              <CheckCircle2 size={16} />
              Seu desconto de 10% está garantido para a conversão!
            </div>
          )}
        </div>
        
        {/* Main Dashboard Preview */}
        <div className="max-w-6xl mx-auto mt-20 relative animate-in fade-in zoom-in duration-1000 delay-1000">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-orange-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div 
                className="relative aspect-video bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl cursor-zoom-in"
                onClick={() => setSelectedImage({ src: "/assets/screenshots/dashboard.png", title: "Painel de Controle" })}
              >
                <img 
                  src="/assets/screenshots/dashboard.png" 
                  alt="TradingFy Dashboard" 
                  className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-700"
                  onError={(e) => e.target.src = "https://placehold.co/1200x800/111/fff?text=Dashboard+Preview"}
                />
              </div>
          </div>
          
          <div className="absolute -top-6 -right-6 bg-orange-500 text-white p-4 rounded-2xl shadow-xl transform rotate-6 hidden md:block">
            <div className="text-xs uppercase font-black tracking-widest mb-1">Resultado Médio</div>
            <div className="text-2xl font-black">+14.2% ao mês</div>
          </div>
        </div>
      </section>

      {/* System Tour Section */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Explore a Ferramenta</h2>
            <p className="text-xl text-muted-foreground">Tudo o que você precisa para uma gestão de elite.</p>
          </div>

          <div className="space-y-32">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                  <BarChart3 size={32} />
                </div>
                <h3 className="text-4xl font-black tracking-tight">Inteligência Analítica</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Não apenas veja seus trades, entenda seu comportamento. Curva de drawdown, rentabilidade por ativo, fator de lucro e anatomia do trade em um só lugar.
                </p>
                <ul className="space-y-3">
                  <Benefit text="Evolução de Patrimônio detalhada" />
                  <Benefit text="Análise de qualidade de setup" />
                  <Benefit text="Comportamento operacional por dia/horário" />
                </ul>
              </div>
              <div className="flex-[1.5] relative group cursor-zoom-in" onClick={() => setSelectedImage({ src: "/assets/screenshots/analytics.png", title: "Inteligência Analítica" })}>
                <div className="absolute -inset-4 bg-blue-500/10 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src="/assets/screenshots/analytics.png" 
                  alt="Analytics Intelligence" 
                  className="rounded-3xl border border-border shadow-2xl relative transition-transform duration-500 group-hover:-translate-y-2"
                  onError={(e) => e.target.src = "https://placehold.co/800x600/111/fff?text=Analytics+Intelligence"}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                  <Clock size={32} />
                </div>
                <h3 className="text-4xl font-black tracking-tight">Histórico Operacional</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Uma auditoria completa das suas operações. Filtre por período, ativo ou tipo de operação e tenha clareza total sobre sua jornada.
                </p>
                <ul className="space-y-3">
                  <Benefit text="Filtros avançados por data e ativo" />
                  <Benefit text="Cálculo automático de P/L líquido" />
                  <Benefit text="Visualização rápida de logs de execução" />
                </ul>
              </div>
              <div className="flex-[1.5] relative group cursor-zoom-in" onClick={() => setSelectedImage({ src: "/assets/screenshots/history.png", title: "Histórico Operacional" })}>
                <div className="absolute -inset-4 bg-purple-500/10 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src="/assets/screenshots/history.png" 
                  alt="Operational History" 
                  className="rounded-3xl border border-border shadow-2xl relative transition-transform duration-500 group-hover:-translate-y-2"
                  onError={(e) => e.target.src = "https://placehold.co/800x600/111/fff?text=Operational+History"}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                  <Globe size={32} />
                </div>
                <h3 className="text-4xl font-black tracking-tight">Mercado Global e Notícias</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Fique à frente dos eventos que movimentam o mercado. Calendário econômico em tempo real com alertas de alta volatilidade.
                </p>
                <ul className="space-y-3">
                  <Benefit text="Calendário Econômico sincronizado" />
                  <Benefit text="Dicas de trading baseadas no feed" />
                  <Benefit text="Filtro de impacto de 3 touros" />
                </ul>
              </div>
              <div className="flex-[1.5] relative group cursor-zoom-in" onClick={() => setSelectedImage({ src: "/assets/screenshots/news.png", title: "Mercado Global e Notícias" })}>
                <div className="absolute -inset-4 bg-orange-500/10 rounded-4xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img 
                  src="/assets/screenshots/news.png" 
                  alt="Global News and Events" 
                  className="rounded-3xl border border-border shadow-2xl relative transition-transform duration-500 group-hover:-translate-y-2"
                  onError={(e) => e.target.src = "https://placehold.co/800x600/111/fff?text=Global+News"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Construído para Trading de Performance</h2>
            <p className="text-muted-foreground">Tudo o que você precisa para sobreviver e lucrar no mercado.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="text-green-500" />}
              title="Análise de Equidade"
              description="Visualize sua curva de capital em tempo real com drawdowns detalhados."
            />
            <FeatureCard 
              icon={<Shield className="text-blue-500" />}
              title="Controle de Risco"
              description="Alertas inteligentes para você nunca violar as regras da sua mesa."
            />
            <FeatureCard 
              icon={<Clock className="text-purple-500" />}
              title="Histórico Completo"
              description="Importe seus trades e identifique padrões vencedores em segundos."
            />
            <FeatureCard 
              icon={<Users className="text-orange-500" />}
              title="Benchmarking"
              description="Compare sua performance com a média de outros traders da comunidade."
            />
            <FeatureCard 
              icon={<Globe className="text-pink-500" />}
              title="Notícias Impactantes"
              description="Filtro de notícias de alto impacto sincronizado com seus horários."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="text-primary" />}
              title="Metas de Lucro"
              description="Acompanhamento visual de objetivos para atingir seu payout mais rápido."
            />
          </div>
        </div>
      </section>

      {/* Full Pricing Section */}
      <section id="pricing" className="py-24">
        <PricingContent />
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-6 bg-linear-to-b from-transparent to-primary/5">
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[100px] opacity-30" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/20 blur-[100px] opacity-30" />
          
          <h2 className="text-4xl font-black tracking-tight mb-6">Comece seu Trial hoje</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Teste sem restrições por 7 dias. Sem letras miúdas, sem cartão.<br />
            Se gostar, planos a partir de <span className="text-foreground font-black font-serif italic">{ref ? 'R$ 22,50' : 'R$ 25,00'}/mês</span> no plano semestral.
          </p>
          
          <button 
            onClick={onStartTrial}
            className="bg-primary text-white text-xl px-12 py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Garantir Meus 7 Dias
            <ArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border mt-12 bg-card/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3 opacity-50">
            <Zap size={20} fill="currentColor" />
            <span className="font-bold tracking-tight">TradingFy</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © 2026 TradingFy Intelligence. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors text-foreground z-[110]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-7xl w-full flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="relative rounded-2xl md:rounded-[2rem] border border-primary/20 shadow-2xl bg-transparent overflow-hidden">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.title} 
                className="max-h-[88vh] md:max-h-[85vh] w-auto max-w-[95vw] md:max-w-full object-contain block shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full border border-border text-xs font-black uppercase tracking-widest text-foreground shadow-xl">
              {selectedImage.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-card border border-border p-8 rounded-4xl hover:border-primary/50 transition-all group">
    <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const Benefit = ({ text }) => (
  <li className="flex items-center gap-2 text-sm font-medium leading-tight">
    <div className="bg-primary/10 p-1 rounded-full text-primary shrink-0">
      <CheckCircle2 size={12} />
    </div>
    <span className="flex-1">{text}</span>
  </li>
);
