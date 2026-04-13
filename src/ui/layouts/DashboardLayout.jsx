import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccounts } from '../contexts/AccountContext';
import { useModal } from '../contexts/ModalContext';
import { TrialGuard } from '../components/TrialGuard';
import { AccountSwitcher } from '../components/AccountSwitcher';
import { 
  Zap, LayoutDashboard, History, Settings, LogOut, 
  MessageSquare, Globe, BarChart3, ShieldCheck, Users 
} from 'lucide-react';
import { AffiliateCouponModal } from '../components/AffiliateCouponModal';

export const DashboardLayout = () => {
  const { user, signOut, refreshProfile } = useAuth();
  const { activeAccount } = useAccounts();
  const { confirm } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const isAffiliateMissingCoupon = user?.profile?.is_affiliate && (!user?.profile?.coupon_code || String(user?.profile?.coupon_code).toLowerCase() === 'null');

  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const TabButton = ({ path, icon, label }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${isActive
            ? 'bg-card text-primary shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
          }`}
      >
        {icon}
        {label && <span className="hidden lg:inline">{label}</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <TrialGuard trialStartDate={user.profile?.trial_start_date} status={user.profile?.subscription_status} />
      
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-x-4 md:gap-x-12">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">TradingFy</h1>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Professional Edition</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-4 bg-muted/30 p-1.5 rounded-2xl border border-border">
            <TabButton path="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <TabButton path="/plans" icon={<Zap size={18} />} label="Planos" />
            <TabButton path="/history" icon={<History size={18} />} label="Histórico" />
            <TabButton path="/analytics" icon={<BarChart3 size={18} />} label="Análise" />
            <TabButton path="/news" icon={<Globe size={18} />} label="Notícias" />
            <TabButton path="/topics" icon={<MessageSquare size={18} />} label="Tópicos" />
            <TabButton path="/accounts" icon={<Settings size={18} />} label="Contas" />
            
            {user?.profile?.is_affiliate && (
              <TabButton 
                path="/affiliate" 
                icon={<Users size={18} className="text-blue-500" />} 
                label="Afiliado" 
              />
            )}
            
            {user?.isAdmin && (
              <TabButton 
                path="/admin" 
                icon={<ShieldCheck size={18} className="text-primary" />} 
                label="Admin" 
              />
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                const confirmed = await confirm({
                  title: 'Sair da Conta?',
                  message: 'Deseja realmente encerrar sua sessão atual? Você precisará fazer login novamente.',
                  type: 'warning'
                });
                if (confirmed) {
                  signOut();
                  navigate('/');
                }
              }}
              className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 pb-32 lg:pb-8">
        {!activeAccount && location.pathname !== '/accounts' ? (
          <div className="py-32 text-center animate-in zoom-in-95">
            <div className="inline-flex p-6 bg-primary/10 rounded-full text-primary mb-6">
              <Settings size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Configure sua primeira conta</h2>
            <p className="text-muted-foreground mb-8">Você precisa cadastrar uma conta (ex: Mesa 50k) antes de começar.</p>
            <button
              onClick={() => navigate('/accounts')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30"
            >
              Ir para Configurações
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-xl border border-border px-4 py-2 rounded-full shadow-2xl z-50 max-w-[95vw]">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mb-2">
          <TabButton path="/dashboard" icon={<LayoutDashboard size={18} />} />
          <TabButton path="/plans" icon={<Zap size={18} />} />
          <TabButton path="/history" icon={<History size={18} />} />
          <TabButton path="/analytics" icon={<BarChart3 size={18} />} />
          <TabButton path="/news" icon={<Globe size={18} />} />
          <TabButton path="/topics" icon={<MessageSquare size={18} />} />
          <TabButton path="/accounts" icon={<Settings size={18} />} />
          {user?.profile?.is_affiliate && <TabButton path="/affiliate" icon={<Users size={18} className="text-blue-500" />} />}
          {user?.isAdmin && <TabButton path="/admin" icon={<ShieldCheck size={18} className="text-primary" />} />}
        </div>
      </nav>

      {/* Forced Affiliate Setup */}
      {isAffiliateMissingCoupon && (
        <AffiliateCouponModal 
          user={user} 
          onSuccess={() => refreshProfile()} 
        />
      )}
    </div>
  );
};
