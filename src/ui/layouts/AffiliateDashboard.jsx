import React, { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, Users, TrendingUp, History, 
  ChevronRight, ExternalLink, Copy, CheckCircle2,
  Mail, Calendar, Zap, ShieldCheck
} from 'lucide-react';
import { WithdrawalModal } from '../components/WithdrawalModal';

export const AffiliateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ balance: 0, referralsCount: 0, totalWithdrawn: 0 });
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' or 'network'
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Link de indicado do parceiro
  const affiliateLink = `https://tradingfy.vercel.app/?ref=${user?.profile?.coupon_code}`;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // 1. Fetch Stats & Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    // 2. Fetch Referrals Count & List using RPC
    const { data: referralsList } = await supabase.rpc('get_my_referrals');
    
    // 3. Fetch Personal Withdrawals
    const { data: withdrawalsHistory } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (profile) {
      setStats({
        balance: profile.affiliate_balance || 0,
        referralsCount: referralsList?.length || 0,
        totalWithdrawn: withdrawalsHistory?.filter(w => w.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
      });
    }

    if (referralsList) setReferrals(referralsList);
    if (withdrawalsHistory) setWithdrawals(withdrawalsHistory);
    
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl" />
        <div className="h-4 w-48 bg-muted rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Share Link */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Cockpit do <span className="text-primary">Embaixador</span></h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Gerencie sua rede, acompanhe seus lucros e cresça com a TradingFy.</p>
        </div>
        
        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border">
          <button 
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'earnings' ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <DollarSign size={14} /> FINANCEIRO
          </button>
          <button 
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'network' ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users size={14} /> MINHA REDE {referrals.length > 0 && <span className="bg-primary/20 px-2 py-0.5 rounded-md ml-1">{referrals.length}</span>}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={DollarSign} 
          label="Saldo Disponível" 
          value={`R$ ${Number(stats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="bg-emerald-500/10 text-emerald-500"
          action={<button onClick={() => setShowWithdrawalModal(true)} className="text-[10px] font-black underline uppercase tracking-widest text-emerald-500/70 hover:text-emerald-500 transition-all cursor-pointer">Solicitar Saque</button>}
        />
        <StatCard 
          icon={Users} 
          label="Membros na Rede" 
          value={stats.referralsCount} 
          color="bg-blue-500/10 text-blue-500"
          action={<span className="text-[10px] font-black uppercase tracking-widest text-blue-500/70">Crescimento real</span>}
        />
        <StatCard 
          icon={History} 
          label="Total Recebido" 
          value={`R$ ${Number(stats.totalWithdrawn).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="bg-primary/10 text-primary"
          action={<span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Lucro acumulado</span>}
        />
      </div>

      {/* Sharing Tools */}
      <div className="bg-card/40 backdrop-blur-md border border-border p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-2xl font-black mb-3">Expanda sua Autoridade</h3>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              Use seu cupom exclusivo <span className="text-primary font-bold">{user?.profile?.coupon_code}</span> para oferecer <span className="text-foreground font-bold">{user?.profile?.affiliate_discount}% de desconto</span> e desbloquear comissões automáticas para sua conta.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 min-w-[300px] bg-background/50 border border-border rounded-2xl px-6 py-4 flex items-center justify-between gap-4 group-hover:border-primary/40 transition-all shadow-inner">
              <span className="text-xs font-mono text-muted-foreground truncate select-all">{affiliateLink}</span>
              <button 
                onClick={copyToClipboard}
                className="p-2.5 hover:bg-primary/20 hover:text-primary rounded-xl transition-all cursor-pointer"
                title="Copiar Link"
              >
                {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
              </button>
            </div>
            <button className="whitespace-nowrap bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-sm hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-primary/20 transition-all cursor-pointer">
              DIVULGAR AGORA 🚀
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {activeTab === 'earnings' ? (
        <div className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-5 duration-700 shadow-xl">
          <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
            <h3 className="font-bold flex items-center gap-3">
              <History size={22} className="text-primary" /> Histórico de Saques Financeiros
            </h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border border-border">Fluxo de Caixa</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                  <th className="px-8 py-6">Data da Solicitação</th>
                  <th className="px-8 py-6">Valor do Resgate</th>
                  <th className="px-8 py-6">Status do Processo</th>
                  <th className="px-8 py-6">Informação Adicional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-20 text-center text-muted-foreground italic font-bold">Nenhuma movimentação financeira registrada.</td></tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6 text-xs font-bold text-muted-foreground">
                        {new Date(w.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-base font-black text-foreground">
                        R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight inline-flex items-center gap-2 ${
                          w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                          w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${w.status === 'paid' ? 'bg-emerald-500' : w.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                          {w.status === 'paid' ? 'PAGO' : w.status === 'rejected' ? 'REJEITADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-muted-foreground font-medium">
                        {w.status === 'paid' ? 'Transferência enviada via PIX' : w.status === 'rejected' ? 'Saldo insuficiente ou erro técnico' : 'Aguardando processamento administrativo'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-5 duration-700 shadow-xl">
          <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
            <h3 className="font-bold flex items-center gap-3">
              <Users size={22} className="text-blue-500" /> Membros Indicados (Minha Rede)
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-blue-500 text-white px-4 py-1.5 rounded-xl border border-blue-400/50 shadow-lg shadow-blue-500/20">{referrals.length} TOTAIS NO SISTEMA</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase font-black tracking-widest border-b border-border">
                  <th className="px-8 py-6">Usuário (Identificação)</th>
                  <th className="px-8 py-6">Data de Ingresso</th>
                  <th className="px-8 py-6 text-right">Status da Assinatura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.length === 0 ? (
                  <tr><td colSpan="3" className="px-8 py-20 text-center text-muted-foreground italic font-bold">Você ainda não possui membros indicados na sua rede exclusiva.</td></tr>
                ) : (
                  referrals.map((r) => (
                    <tr key={r.user_id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Zap size={22} fill="currentColor" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-foreground/90 block">{r.masked_email}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Lead ID: {r.user_id.substring(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-muted-foreground flex items-center gap-2 mt-3">
                        <Calendar size={14} className="opacity-50" />
                        {new Date(r.joined_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          r.status === 'active' || r.status === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 
                          r.status === 'trial' ? 'bg-blue-500/10 text-blue-500' : 
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {r.status === 'active' ? 'ASSINANTE ATIVO' : r.status === 'trial' ? 'PERÍODO EXPERIMENTAL' : r.status === 'expired' ? 'PLANO ENCERRADO' : r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showWithdrawalModal && (
        <WithdrawalModal 
          balance={stats.balance} 
          onClose={() => setShowWithdrawalModal(false)} 
          onSuccess={() => {
            setShowWithdrawalModal(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, action }) => (
  <div className="bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all duration-500 shadow-xl group cursor-default">
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-20 transition-transform group-hover:rotate-12`}>
        <Icon size={26} />
      </div>
      {action}
    </div>
    <p className="text-muted-foreground font-black text-xs uppercase tracking-widest">{label}</p>
    <h3 className="text-3xl font-black mt-2 tracking-tight group-hover:text-primary transition-colors">{value}</h3>
  </div>
);
