import React, { useState } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Check, AlertCircle, Send } from 'lucide-react';

export const WithdrawalModal = ({ balance, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const withdrawAmount = Number(amount);

    if (withdrawAmount <= 0) {
      setError('O valor deve ser maior que zero.');
      setLoading(false);
      return;
    }

    if (withdrawAmount > balance) {
      setError('Saldo insuficiente para realizar este saque.');
      setLoading(false);
      return;
    }

    if (withdrawAmount < 50) {
      setError('O valor mínimo para saque é R$ 50,00.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: withdrawAmount,
        pix_key: pixKey,
        status: 'pending'
      });

    if (insertError) {
      setError('Erro ao processar solicitação. Tente novamente.');
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-card border border-border rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-emerald-500/10 rounded-3xl text-emerald-500 mb-6">
            <Wallet size={48} />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Solicitar Saque</h2>
          <p className="text-muted-foreground font-medium italic">
            Saldo disponível: <span className="text-foreground font-bold">R$ {Number(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Valor do Resgate (R$)</label>
            <input
              type="number"
              required
              min="50"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-background border border-border focus:border-emerald-500 px-6 py-5 rounded-[2rem] text-xl font-black outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Chave PIX para Recebimento</label>
            <input
              type="text"
              required
              placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              value={pixKey}
              onChange={e => setPixKey(e.target.value)}
              className="w-full bg-background border border-border focus:border-emerald-500 px-6 py-5 rounded-[2rem] text-sm font-bold outline-none transition-all"
            />
            <p className="text-[10px] text-muted-foreground italic ml-2">
              * Certifique-se de que a chave está correta para evitar atrasos.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 animate-pulse">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-5 rounded-[2rem] font-black border border-border hover:bg-muted transition-all text-xs"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>CONFIRMAR SOLICITAÇÃO</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
