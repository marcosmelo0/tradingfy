import React, { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, Users, ArrowUpRight, Clock, 
  CheckCircle, AlertCircle, Wallet, Plus 
} from 'lucide-react';
import { WithdrawalModal } from '../components/WithdrawalModal';

const StatCard = ({ icon: Icon, label, value, color, description }) => (
  <div className="bg-card/40 backdrop-blur-md border border-border p-8 rounded-[2.5rem] relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-all duration-500`} />
    <div className="flex items-center justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={28} />
      </div>
      <ArrowUpRight size={20} className="text-muted-foreground opacity-30" />
    </div>
    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{label}</p>
    <h3 className="text-4xl font-black mt-2 tracking-tight">{value}</h3>
    {description && <p className="text-[10px] text-muted-foreground mt-4 font-medium italic">{description}</p>}
  </div>
);

export const AffiliateDashboard = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Count referrals
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', user.id);
      
      setTotalReferrals(count || 0);

      // Fetch withdrawals
      const { data } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados do afiliado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const balance = user?.profile?.affiliate_balance || 0;
  const totalPaid = withdrawals
    .filter(w => w.status === 'paid')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2">Painel de <span className="text-blue-500">Afiliado</span></h1>
          <p className="text-muted-foreground font-medium">Gerencie suas indicações, acompanhe seu saldo e solicite seus lucros.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-sm"
        >
          <Plus size={20} />
          SOLICITAR SAQUE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          icon={Wallet} 
          label="Saldo Disponível" 
          value={`R$ ${Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="bg-emerald-500"
          description="Aguardando sua solicitação de saque via PIX."
        />
        <StatCard 
          icon={Users} 
          label="Total de Afiliações" 
          value={totalReferrals} 
          color="bg-blue-500"
          description="Quantidade de traders que entraram pelo seu link."
        />
        <StatCard 
          icon={CheckCircle} 
          label="Total Sacado" 
          value={`R$ ${Number(totalPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="bg-purple-500"
          description="Valor total que já foi enviado para sua conta."
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Clock size={24} className="text-muted-foreground" />
          <h2 className="text-2xl font-black tracking-tight">Histórico de Saques</h2>
        </div>
        
        <div className="bg-card/40 backdrop-blur-md border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chave PIX</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-16 text-center text-muted-foreground font-medium italic">
                    Nenhuma solicitação de saque realizada até o momento.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-foreground/70">
                        {new Date(w.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-foreground">
                        R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
                        {w.pix_key}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                        w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {w.status === 'paid' ? 'Pago' : w.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <WithdrawalModal 
          balance={balance} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};
