import React, { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { 
  Users, Zap, Clock, ShieldCheck, Search, 
  MoreVertical, Calendar, TrendingUp, AlertCircle 
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const { confirm } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch from the new view that includes emails
    const { data, error } = await supabase
      .from('admin_profiles_view')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
      calculateStats(data);
    } else if (error) {
      console.error('Erro ao buscar dados (View não encontrada?):', error.message);
      // Fallback for profiles if view fails
      const { data: fallback } = await supabase.from('profiles').select('*');
      if (fallback) {
        setUsers(fallback);
        calculateStats(fallback);
      }
    }
    setLoading(false);
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
    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', editingUser.id);

    if (!error) {
      setEditingUser(null);
      fetchData();
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm({
      title: 'Excluir Usuário?',
      message: 'Esta ação é irreversível e removerá todos os dados do usuário. Continuar?',
      type: 'danger'
    });

    if (confirmed) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (!error) fetchData();
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              className="bg-background/50 border border-border rounded-xl pl-12 pr-6 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none w-full md:w-80"
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
                <th className="px-6 py-4">Expiração</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium">{u.id.substring(0, 6)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground/80 font-medium">{u.email || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      u.subscription_status === 'active' || u.subscription_status === 'admin' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {u.subscription_end_date ? new Date(u.subscription_end_date).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary"><Zap size={18} /></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500"><Zap size={18} className="rotate-45" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdateUser} 
        />
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
  const [date, setDate] = useState(user.subscription_end_date ? user.subscription_end_date.split('T')[0] : '');

  const addDays = (days) => {
    const current = date ? new Date(date) : new Date();
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-bold mb-6">Editar Gestão</h3>
        <p className="text-sm text-muted-foreground mb-8">Usuário: <span className="text-foreground font-medium">{user.email}</span></p>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="expired">Expirado</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Data de Expiração</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2 pt-2">
              {[30, 90, 365].map(days => (
                <button 
                  key={days}
                  onClick={() => addDays(days)}
                  className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg transition-all"
                >
                  +{days} DIAS
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-bold border border-border hover:bg-muted transition-all text-sm">Cancelar</button>
          <button 
            onClick={() => onSave({ subscription_status: status, subscription_end_date: date })}
            className="flex-1 px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 text-sm"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
