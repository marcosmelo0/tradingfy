import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const affiliateId = localStorage.getItem('tradingfy_affiliate');
    
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password, affiliateId);

    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary mb-6">
            <Lock size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">TradingFy <span className="text-primary">PRO</span></h1>
          <p className="text-muted-foreground">O controle total da sua mesa proprietária em um só lugar.</p>
        </div>

        <div className="bg-card border border-border p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  required
                  className="w-full bg-background border border-border pl-12 pr-4 py-4 rounded-2xl focus:border-primary outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  required
                  className="w-full bg-background border border-border pl-12 pr-4 py-4 rounded-2xl focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <p className="text-center mt-10 text-xs text-muted-foreground font-medium">
          Segurança garantida via Supabase Infrastructure.
        </p>
      </div>
    </div>
  );
};
