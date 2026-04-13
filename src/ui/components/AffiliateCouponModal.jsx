import React, { useState } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { Gift, Check, AlertCircle, Sparkles } from 'lucide-react';

export const AffiliateCouponModal = ({ user, onSuccess }) => {
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanCoupon = coupon.trim().toUpperCase().replace(/\s/g, '');
    
    if (cleanCoupon.length < 3) {
      setError('O cupom deve ter pelo menos 3 caracteres.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.rpc('register_affiliate_coupon', {
      new_coupon: cleanCoupon
    });

    if (updateError) {
      if (updateError.code === '23505') {
        setError('Este cupom já está em uso por outro parceiro.');
      } else {
        setError('Erro ao salvar cupom. Tente outro nome.');
      }
    } else {
      onSuccess(cleanCoupon);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/95 backdrop-blur-xl p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-card border border-border rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-blue-500/10 rounded-3xl text-blue-500 mb-6 shadow-inner">
            <Gift size={48} />
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-4">Bem-vindo ao Time! 🚀</h2>
          <p className="text-muted-foreground leading-relaxed">
            Você foi promovido a **Afiliado Oficial** do TradingFy. 
            Crie agora seu cupom exclusivo de {user?.profile?.affiliate_discount || 10}% OFF para sua rede.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Escolha seu código exclusivo</label>
            <div className="relative group">
              <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:animate-pulse" size={20} />
              <input
                type="text"
                required
                autoFocus
                placeholder="EX: TRADERPRO10"
                value={coupon}
                onChange={e => setCoupon(e.target.value.toUpperCase())}
                className="w-full bg-background border-2 border-border focus:border-blue-500 px-16 py-6 rounded-[2rem] text-xl font-black outline-none transition-all placeholder:text-muted-foreground/30"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full uppercase">
                  {user?.profile?.affiliate_discount || 10}% OFF
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/60 ml-2 italic">
              * Sem espaços ou caracteres especiais. Apenas letras e números.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <Check size={24} />
                <span>ATIVAR MINHA PARCERIA</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-40">
          TradingFy Partnership Protocol v2.0
        </p>
      </div>
    </div>
  );
};
