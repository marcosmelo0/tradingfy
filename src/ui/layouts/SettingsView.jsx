import React, { useState } from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { useModal } from '../contexts/ModalContext';
import { Plus, Save, Trash2, Settings2, RefreshCw, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PLAN_NAMES = {
  'price_1TLPDZDbUw3ACMsAFMeTwJ8q': 'Mensal',
  'price_1TLPDaDbUw3ACMsAwaiZMwW5': 'Trimestral',
  'price_1TLPDaDbUw3ACMsAEjCiKZzh': 'Semestral'
};

export const SettingsView = () => {
  const { createAccount, deleteAccount, clearTrades, accounts, loading } = useAccounts();
  const { user, manageSubscription } = useAuth();
  const { confirm } = useModal();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    initial_margin: 25000,
    buffer_value: 0,
    profit_target: 3000,
    has_median: true,
    median_multiplier: 5,
    type: 'challenge'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAccount(formData);
    setShowAdd(false);
    setFormData({ name: '', initial_margin: 25000, buffer_value: 0, profit_target: 3000, has_median: true, median_multiplier: 5, type: 'challenge' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="text-primary" /> Configurações de Contas
          </h2>
          <p className="text-muted-foreground text-sm">Gerencie suas mesas proprietárias e regras de risco.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:scale-105 transition-all cursor-pointer"
        >
          <Plus size={18} /> Nova Conta
        </button>
      </div>

      {/* Subscription Status Section */}
      <div className="bg-card border border-primary/20 p-6 rounded-3xl shadow-xl shadow-primary/5 relative overflow-hidden group">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <CreditCard size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-black tracking-tight whitespace-nowrap">Assinatura & Plano</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${
                  user?.profile?.subscription_status === 'active' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {user?.profile?.subscription_status === 'active' ? 'Ativo' : 'Trial / Pendente'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  Plano: <span className="text-foreground font-bold">{PLAN_NAMES[user?.profile?.plan_type] || 'Professional Edition'}</span>
                </span>
                {user?.profile?.subscription_end_date && (
                  <>
                    <span className="hidden xs:inline w-1 h-1 bg-border rounded-full"></span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Calendar size={14} /> {new Date(user.profile.subscription_end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </>
                )}
              </div>
              {user?.profile?.cancel_at_period_end && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                  <AlertCircle size={14} /> Assinatura será encerrada ao final do período
                </div>
              )}
            </div>
          </div>
          
          {user?.profile?.stripe_customer_id && (
            <button 
              onClick={manageSubscription}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-foreground/10"
            >
              Gerenciar Assinatura / Cancelar
            </button>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="bg-card border border-primary/20 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Conta</label>
              <input 
                required
                placeholder="Ex: Mesa 25K Apex"
                className="w-full bg-background border border-border p-3 rounded-xl focus:border-primary outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Margem Inicial (Challenge)</label>
              <input 
                type="number"
                className="w-full bg-background border border-border p-3 rounded-xl focus:border-primary outline-none transition-all"
                value={formData.initial_margin}
                onChange={e => setFormData({...formData, initial_margin: e.target.value === '' ? '' : Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Valor do Colchão</label>
              <input 
                type="number"
                className="w-full bg-background border border-border p-3 rounded-xl focus:border-primary outline-none transition-all"
                value={formData.buffer_value}
                onChange={e => setFormData({...formData, buffer_value: e.target.value === '' ? '' : Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase text-primary">Meta de Lucro (Target)</label>
              <input 
                type="number"
                className="w-full bg-background border border-primary/20 p-3 rounded-xl focus:border-primary outline-none transition-all shadow-lg shadow-primary/5"
                value={formData.profit_target}
                onChange={e => setFormData({...formData, profit_target: e.target.value === '' ? '' : Number(e.target.value)})}
              />
            </div>

            <div className="flex items-center gap-4 bg-background/50 p-4 rounded-2xl border border-border">
              <input 
                type="checkbox"
                id="has_median"
                className="w-5 h-5 accent-primary cursor-pointer"
                checked={formData.has_median}
                onChange={e => setFormData({...formData, has_median: e.target.checked})}
              />
              <label htmlFor="has_median" className="text-sm font-bold cursor-pointer">Seguir Regra da Mediana</label>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Tipo de Conta (Fase)</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: 'challenge'})}
                   className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${formData.type === 'challenge' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                 >
                    <span className="font-black text-lg">Challenge</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Drawdown Estático</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, type: 'funded'})}
                   className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${formData.type === 'funded' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                 >
                    <span className="font-black text-lg">Funded</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Trailing RT</span>
                 </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Multiplicador da Mediana</label>
              <input 
                type="number"
                disabled={!formData.has_median}
                className="w-full bg-background border border-border p-3 rounded-xl focus:border-primary outline-none transition-all disabled:opacity-30"
                value={formData.median_multiplier}
                onChange={e => setFormData({...formData, median_multiplier: e.target.value === '' ? '' : Number(e.target.value)})}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
               <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
               >
                 Cancelar
               </button>
               <button 
                  type="submit"
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
               >
                 <Save size={18} /> Salvar Configurações
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-card border border-border p-6 rounded-3xl hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                 <Plus size={24} />
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Resetar Conta?',
                      message: `Deseja apagar todos os trades de "${acc.name}"? Esta ação não pode ser desfeita.`,
                      type: 'warning'
                    });
                    
                    if (confirmed) {
                      await clearTrades(acc.id);
                    }
                  }}
                  title="Resetar Dados"
                  className="text-muted-foreground hover:text-blue-500 transition-colors p-2 cursor-pointer"
                >
                   <RefreshCw size={18} />
                </button>
                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Excluir Conta?',
                      message: `Tem certeza que deseja excluir "${acc.name}"? Todos os trades vinculados serão removidos permanentemente.`,
                      type: 'danger'
                    });
                    
                    if (confirmed) {
                      deleteAccount(acc.id);
                    }
                  }}
                  title="Excluir Conta"
                  className="text-muted-foreground hover:text-red-500 transition-colors p-2 cursor-pointer"
                >
                   <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              {acc.name}
              <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-black ${acc.type === 'funded' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {acc.type}
              </span>
            </h3>
            <p className="text-2xl font-black text-foreground mb-4">
              {acc.initial_margin.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
            <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
               <div className="flex justify-between">
                  <span>Colchão:</span>
                  <span className="font-bold text-foreground">$ {acc.buffer_value.toLocaleString('en-US')}</span>
               </div>
               <div className="flex justify-between">
                  <span>Meta:</span>
                  <span className="font-bold text-primary">$ {acc.profit_target.toLocaleString('en-US')}</span>
               </div>
               <div className="flex justify-between">
                  <span>Mediana:</span>
                  <span className={`font-bold ${acc.has_median ? 'text-green-500' : 'text-red-500'}`}>
                    {acc.has_median ? `Ativa (${acc.median_multiplier}x)` : 'Inativa'}
                  </span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
