import React, { useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { 
  Users, Zap, Clock, ShieldCheck, Search, 
  MoreVertical, Calendar, TrendingUp, AlertCircle 
} from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { confirm } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch all profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(u => u.subscription_status === 'active' || u.subscription_status === 'admin').length;
    const trial = data.filter(u => u.subscription_status === 'trial').length;
    const expired = data.filter(u => u.subscription_status === 'expired').length;
    
    setStats({ total, active, trial, expired });
  };

  const handleUpdatePlan = async (userId, newStatus) => {
    const confirmed = await confirm({
      title: 'Alterar Plano?',
      message: `Deseja realmente alterar o status deste usuário para "${newStatus}"?`,
      type: 'warning'
    });

    if (confirmed) {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: newStatus })
        .eq('id', userId);

      if (!error) {
        fetchData();
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.subscription_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Usuários Totais" 
          value={stats.total} 
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          icon={ShieldCheck} 
          label="Assinaturas Ativas" 
          value={stats.active} 
          color="bg-emerald-500/10 text-emerald-500" 
        />
        <StatCard 
          icon={Clock} 
          label="Em Período Trial" 
          value={stats.trial} 
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Planos Expirados" 
          value={stats.expired} 
          color="bg-red-500/10 text-red-500" 
        />
      </div>

      {/* Users Table Section */}
      <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Gestão de Membros</h2>
            <p className="text-sm text-muted-foreground text-pretty">Gerencie acessos e visualize o status de cada conta.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar por ID ou Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/50 border border-border rounded-xl pl-12 pr-6 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Usuário (ID)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expiração</th>
                <th className="px-6 py-4">Primeira Compra</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {u.role === 'admin' ? 'AD' : 'US'}
                      </div>
                      <span className="text-sm font-medium">{u.id.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                      u.subscription_status === 'active' || u.subscription_status === 'admin'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : u.subscription_status === 'trial'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {u.subscription_end_date 
                        ? new Date(u.subscription_end_date).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{u.is_first_purchase ? 'Sim' : 'Não'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleUpdatePlan(u.id, u.subscription_status === 'active' ? 'expired' : 'active')}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="Alternar Status"
                      >
                        <ShieldCheck size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
