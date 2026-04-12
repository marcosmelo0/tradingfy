import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, X } from 'lucide-react';

export const TrialGuard = ({ trialStartDate, status }) => {
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!trialStartDate || status !== 'trial') return;

    const start = new Date(trialStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(7 - diffDays);
  }, [trialStartDate, status]);

  if (status !== 'trial' || daysRemaining === null || daysRemaining > 2 || !isVisible) {
    return null;
  }

  const isLastDay = daysRemaining <= 0;

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-60 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-8 duration-500`}>
      <div className={`p-1 rounded-4xl shadow-2xl ${isLastDay ? 'bg-linear-to-r from-red-600 to-orange-500' : 'bg-linear-to-r from-primary to-orange-400'}`}>
        <div className="bg-card/90 backdrop-blur-xl rounded-[1.9rem] p-4 flex items-center justify-between gap-4 border border-white/10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isLastDay ? 'bg-red-500' : 'bg-primary'} text-white shadow-lg`}>
              {isLastDay ? <AlertTriangle size={24} /> : <Zap size={24} fill="currentColor" />}
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider leading-none mb-1">
                {isLastDay ? 'Última chance!' : 'Seu teste acaba em breve'}
              </h4>
              <p className="text-xs font-medium text-muted-foreground">
                {isLastDay 
                  ? 'Garanta seu acesso agora com 10% OFF antes de perder seus dados.'
                  : `Restam menos de ${daysRemaining + 1} dias. Garanta 10% OFF com cupom.`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className={`${isLastDay ? 'bg-red-500' : 'bg-primary'} text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer`}>
              Resgatar Desconto
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
