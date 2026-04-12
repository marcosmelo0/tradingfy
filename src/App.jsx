import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainDashboard from './ui/layouts/Dashboard';
import { AuthView } from './ui/layouts/AuthView';
import { HistoryView } from './ui/layouts/HistoryView';
import { SettingsView } from './ui/layouts/SettingsView';
import { SuggestionsView } from './ui/layouts/SuggestionsView';
import { NewsView } from './ui/layouts/NewsView';
import { AnalyticsView } from './ui/layouts/AnalyticsView';
import { useAuth } from './ui/contexts/AuthContext';
import { useAccounts } from './ui/contexts/AccountContext';
import { useModal } from './ui/contexts/ModalContext';
import { supabase } from './infrastructure/supabase';
import { LandingPage } from './ui/layouts/LandingPage';
import { ConversionView } from './ui/layouts/ConversionView';
import { ProtectedRoute } from './ui/components/ProtectedRoute';
import { DashboardLayout } from './ui/layouts/DashboardLayout';
import { Loader2, ArrowRight } from 'lucide-react';
import { AdminGuard } from './ui/components/AdminGuard';
import { AffiliateDashboard } from './ui/layouts/AffiliateDashboard';
import { AffiliateGuard } from './ui/components/AffiliateGuard';

function App() {
  const { user, loading: authLoading, signOut, subscribe } = useAuth();
  const { activeAccount } = useAccounts();
  const { confirm } = useModal();
  const navigate = useNavigate();
  
  const [trades, setTrades] = useState([]);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Efeito para retomar checkout pendente após login
  useEffect(() => {
    if (user && !authLoading) {
      const pending = localStorage.getItem('tradingfy_pending_plan');
      if (pending) {
        const { priceId, hasAffiliate } = JSON.parse(pending);
        localStorage.removeItem('tradingfy_pending_plan');
        subscribe(priceId, hasAffiliate);
      }
    }
  }, [user, authLoading, subscribe]);

  // Efeito para mensagens de sucesso/cancelamento do Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      confirm({
        title: 'Bem-vindo ao Time! 🚀',
        message: 'Sua assinatura foi ativada com sucesso. Agora você tem acesso total ao TradingFy.',
        type: 'success'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('canceled')) {
      confirm({
        title: 'Pagamento não concluído',
        message: 'O processo de assinatura foi cancelado. Se precisar de ajuda, entre em contato conosco.',
        type: 'warning'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [confirm]);

  useEffect(() => {
    if (activeAccount) {
      fetchTrades();
      fetchWithdrawals();
    } else {
      setTrades([]);
      setTotalWithdrawn(0);
    }
  }, [activeAccount]);

  const fetchWithdrawals = async () => {
    if (!activeAccount) return;
    const { data, error } = await supabase
      .from('withdrawals')
      .select('amount')
      .eq('account_id', activeAccount.id);

    if (!error) {
      const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalWithdrawn(total);
    }
  };

  const fetchTrades = async () => {
    if (!activeAccount) return;
    setTradesLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('account_id', activeAccount.id)
      .order('close_date', { ascending: false });

    if (!error) {
      const domainTrades = data.map(t => ({
        id: t.id,
        asset: t.asset,
        openDate: t.open_date,
        closeDate: t.close_date,
        result: Number(t.result),
        type: t.side
      }));
      setTrades(domainTrades);
    }
    setTradesLoading(false);
  };

  const isTrialExpired = useMemo(() => {
    if (!user?.profile || user.profile.subscription_status !== 'trial') return false;
    const start = new Date(user.profile.trial_start_date);
    const now = new Date();
    const diffDays = (now - start) / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  // Expired trial flow
  if (user && isTrialExpired && !user.isAdmin) {
    return <ConversionView />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : 
        (showAuth ? (
          <div className="relative">
            <button 
              onClick={() => setShowAuth(false)}
              className="fixed top-6 left-6 z-60 text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="rotate-180" size={16} /> Voltar
            </button>
            <AuthView />
          </div>
        ) : <LandingPage onStartTrial={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} />)
      } />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={
          <MainDashboard
            trades={trades}
            onRefresh={async () => {
              await fetchTrades();
              await fetchWithdrawals();
            }}
            totalWithdrawn={totalWithdrawn}
          />
        } />
        <Route path="/history" element={<HistoryView trades={trades} />} />
        <Route path="/analytics" element={<AnalyticsView trades={trades} activeAccount={activeAccount} />} />
        <Route path="/news" element={<NewsView />} />
        <Route path="/topics" element={<SuggestionsView />} />
        <Route path="/accounts" element={<SettingsView />} />
        <Route path="/plans" element={
          <div className="py-8">
            <LandingPage onlyPricing={true} onStartTrial={() => navigate('/dashboard')} onLogin={() => {}} />
          </div>
        } />
        
        {/* Admin Secret Route */}
          <Route path="/admin" element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          } />

          <Route path="/affiliate" element={
            <AffiliateGuard>
              <AffiliateDashboard />
            </AffiliateGuard>
          } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
