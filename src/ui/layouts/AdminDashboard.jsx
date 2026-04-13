import React, { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { 
  Users, Zap, Clock, ShieldCheck, Search, 
  MoreVertical, Calendar, TrendingUp, AlertCircle,
  Edit2, Trash2
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('members'); // 'members' or 'withdrawals'
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const { confirm } = useModal();

  useEffect(() => {
    fetchData();
    fetchWithdrawals();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_profiles_view')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });
    
    if (data) setWithdrawals(data);
  };

  const handleProcessWithdrawal = async (id, status) => {
    const action = status === 'paid' ? 'APROVAR PAGAMENTO' : 'REJEITAR';
    const confirmed = await confirm({
      title: `${action}?`,
      message: `Tem certeza que deseja marcar este saque como ${status === 'paid' ? 'pago' : 'rejeitado'}?`,
      type: status === 'paid' ? 'primary' : 'danger'
    });

    if (confirmed) {
      const { error } = await supabase.rpc('process_withdrawal', {
        request_id: id,
        new_status: status
      });

      if (!error) {
        fetchWithdrawals();
        fetchData(); // Update balances
      } else {
        alert('Erro ao processar: ' + error.message);
      }
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter(u => u.subscription_status === 'active' || u.subscription_status === 'admin').length,
      trial: data.filter(u => u.subscription_status === 'trial').length,
      expired: data.filter(u => u.subscription_status === 'expired').length
    });
  };

  const handleUpdateUser = async (updatedData) => {
    const { error } = await supabase.rpc('admin_update_profile', {
      target_user_id: editingUser.id,
      new_status: updatedData.subscription_status,
      new_end_date: updatedData.subscription_end_date,
      new_is_affiliate: updatedData.is_affiliate,
      new_affiliate_discount: updatedData.affiliate_discount
    });

    if (!error) {
      setEditingUser(null);
      fetchData();
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm({
      title: 'Excluir Usuário?',
      message: 'Esta ação removerá todos os dados do usuário. Continuar?',
      type: 'danger'
    });

    if (confirmed) {
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (!error) fetchData();
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Painel <span className="text-primary">Admin</span></h1>
          <p className="text-muted-foreground font-medium text-sm">Gestão centralizada de membros e finanças.</p>
        </div>
        
        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border">
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'members' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            MEMBROS
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'withdrawals' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            SAQUES {withdrawals.filter(w => w.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-500 text-white w-2 h-2 rounded-full inline-block animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'members' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard icon={Users} label="Usuários Totais" value={stats.total} color="bg-blue-500/10 text-blue-500" />
            <StatCard icon={ShieldCheck} label="Assinaturas" value={stats.active} color="bg-emerald-500/10 text-emerald-500" />
            <StatCard icon={Clock} label="Trial" value={stats.trial} color="bg-amber-500/10 text-amber-500" />
            <StatCard icon={AlertCircle} label="Expirados" value={stats.expired} color="bg-red-500/10 text-red-500" />
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Gestão de Membros</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar por e-mail ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background/50 border border-border rounded-xl pl-12 pr-6 py-2.5 text-sm outline-none w-full md:w-80"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">E-mail</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Saldo</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium">{u.id.substring(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground/80">{u.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            u.subscription_status === 'active' || u.subscription_status === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {u.subscription_status}
                          </span>
                          {u.is_affiliate && <Users size={14} className="text-blue-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black">
                        R$ {Number(u.affiliate_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-muted-foreground">
                          <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Solicitações de Saque</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Chave PIX</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {withdrawals.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium italic">Nenhum saque solicitado até o momento.</td></tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          w.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                          w.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {w.status === 'paid' ? 'Pago' : w.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{w.profiles?.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-black">R$ {Number(w.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{w.pix_key}</td>
                      <td className="px-6 py-4 text-right">
                        {w.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleProcessWithdrawal(w.id, 'paid')}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-500 transition-all"
                            >
                              PAGAR
                            </button>
                            <button 
                              onClick={() => handleProcessWithdrawal(w.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black hover:bg-red-500 transition-all"
                            >
                              REJEITAR
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-card/40 backdrop-blur-md border border-border p-6 rounded-3xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      <TrendingUp size={20} className="text-emerald-500" />
    </div>
    <p className="text-muted-foreground font-medium text-sm">{label}</p>
    <h3 className="text-3xl font-black mt-1">{value}</h3>
  </div>
);

const EditUserModal = ({ user, onClose, onSave }) => {
  const [status, setStatus] = useState(user.subscription_status);
  const [isAffiliate, setIsAffiliate] = useState(user.is_affiliate || false);
  const [discount, setDiscount] = useState(user.affiliate_discount || 10);
  const [date, setDate] = useState(user.subscription_end_date ? user.subscription_end_date.split('T')[0] : '');

  const addDays = (days) => {
    const current = date ? new Date(date) : new Date();
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-2xl font-black">Editar Gestão</h3>
          <p className="text-sm text-muted-foreground mt-1">Membro: <span className="text-foreground font-medium">{user.email}</span></p>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 bg-background border border-border rounded-2xl space-y-4">
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex items-center gap-3">
                <Users className="text-blue-500" size={20} />
                <span className="text-sm font-bold">Modo Afiliado</span>
              </div>
              <input 
                type="checkbox" 
                checked={isAffiliate}
                onChange={(e) => setIsAffiliate(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            {isAffiliate && (
              <div className="pt-4 border-t border-border animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Desconto (%)</label>
                <div className="mt-1 flex items-center gap-3">
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value))}
                    className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-2 outline-none focus:border-primary font-bold text-sm"
                    min="1"
                    max="100"
                  />
                  <span className="text-sm font-black text-primary">% OFF</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status do Plano</label>
            <div className="relative">
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:border-primary transition-all appearance-none text-sm font-bold"
              >
                <option value="active" className="bg-background">👑 Ativo (Full Access)</option>
                <option value="trial" className="bg-background">⏳ Período Trial</option>
                <option value="expired" className="bg-background">❌ Plano Expirado</option>
                <option value="admin" className="bg-background">🛡️ Administrador</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <ShieldCheck size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Data de Expiração</label>
            <div className="relative">
              <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-primary transition-all text-sm font-bold [color-scheme:dark]"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {[30, 90, 365].map(days => (
                <button 
                  key={days}
                  onClick={() => addDays(days)}
                  className="px-4 py-2 bg-muted/50 hover:bg-primary/20 text-foreground hover:text-primary text-[10px] font-black rounded-xl transition-all border border-border"
                >
                  +{days} DIAS
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-10 bg-muted/20 p-2 rounded-2xl md:rounded-3xl">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-4 rounded-2xl font-black border border-border hover:bg-muted transition-all text-xs"
          >
            CANCELAR
          </button>
          <button 
            onClick={() => onSave({ 
              subscription_status: status, 
              subscription_end_date: date,
              is_affiliate: isAffiliate,
              affiliate_discount: discount
            })}
            className="flex-1 px-4 py-4 rounded-2xl font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20 text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
