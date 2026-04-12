import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Filter, Loader2, ArrowRight } from 'lucide-react';
import { useAccounts } from '../contexts/AccountContext';

export const WithdrawalModal = ({ isOpen, onClose, onRefresh }) => {
  const { registerWithdrawal, fetchWithdrawals, activeAccount } = useAccounts();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    if (isOpen && activeAccount) {
      loadHistory();
    }
  }, [isOpen, activeAccount, period]);

  const loadHistory = async () => {
    setLoading(true);
    let filters = {};
    const now = new Date();
    
    if (period === 'month') {
      filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    } else if (period === 'last30') {
      const last30 = new Date();
      last30.setDate(now.getDate() - 30);
      filters.startDate = last30.toISOString();
    }

    const { data, error } = await fetchWithdrawals(filters);
    if (!error) setHistory(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    setSubmitting(true);
    const { error } = await registerWithdrawal(Number(amount), new Date(date).toISOString());
    
    if (error) {
      alert('Erro ao registrar saque: ' + error.message);
    } else {
      setAmount('');
      await loadHistory();
      if (onRefresh) onRefresh();
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-border bg-muted/30">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <DollarSign className="text-primary" /> Gestão de Saques
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Conta: {activeAccount?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Form Side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ArrowRight size={14} className="text-primary" /> Novo Registro
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Valor (US$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-background border-border border-2 rounded-2xl py-4 pl-12 pr-4 font-black text-xl focus:border-primary transition-all outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Data do Saque</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-background border-border border-2 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-primary transition-all outline-hidden cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    disabled={submitting}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Saque'}
                  </button>
                  
                  <p className="text-[10px] text-center text-muted-foreground font-bold uppercase py-2 leading-relaxed">
                    ⚠️ Ao registrar o saque, a meta da conta será zerada conforme as regras da mesa.
                  </p>
                </form>
              </div>
            </div>

            {/* History Side */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Filter size={14} className="text-primary" /> Histórico de Saques
                </h3>
                <div className="flex bg-muted rounded-xl p-1 gap-1">
                  <FilterButton active={period === 'all'} onClick={() => setPeriod('all')}>Tudo</FilterButton>
                  <FilterButton active={period === 'month'} onClick={() => setPeriod('month')}>Mês</FilterButton>
                  <FilterButton active={period === 'last30'} onClick={() => setPeriod('last30')}>30 Dias</FilterButton>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                   <Loader2 className="animate-spin mb-4" size={40} />
                   <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Carregando histórico...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="bg-muted/20 border-2 border-dashed border-border rounded-3xl p-12 text-center animate-in fade-in slide-in-from-bottom-4">
                  <DollarSign size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-bold tracking-tight">Nenhum saque registrado neste período.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {history.map((withdrawal) => (
                    <div key={withdrawal.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between hover:border-primary/50 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="bg-green-500/10 text-green-500 p-3 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                            <DollarSign size={18} />
                         </div>
                         <div>
                            <p className="font-black text-lg">
                               {Number(withdrawal.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                               {new Date(withdrawal.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[9px] bg-muted px-2 py-1 rounded-md font-black uppercase tracking-tighter text-muted-foreground">Processado</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, children, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all cursor-pointer ${
      active ? 'bg-card text-primary shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);
