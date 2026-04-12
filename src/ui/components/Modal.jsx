import React from 'react';
import { AlertCircle, X, Check, HelpCircle } from 'lucide-react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning' 
}) => {
  if (!isOpen) return null;

  const themes = {
    warning: {
      icon: <HelpCircle className="text-yellow-500" size={32} />,
      btn: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20',
      outline: 'border-yellow-500/20 bg-yellow-500/10'
    },
    danger: {
      icon: <AlertCircle className="text-red-500" size={32} />,
      btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
      outline: 'border-red-500/20 bg-red-500/10'
    },
    success: {
      icon: <Check className="text-green-500" size={32} />,
      btn: 'bg-green-500 hover:bg-green-600 shadow-green-500/20',
      outline: 'border-green-500/20 bg-green-500/10'
    }
  };

  const theme = themes[type] || themes.warning;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className={`inline-flex p-4 rounded-3xl mb-6 border ${theme.outline}`}>
             {theme.icon}
          </div>
          
          <h3 className="text-2xl font-black mb-3 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col gap-3">
             <button 
               onClick={onConfirm}
               className={`w-full py-4 rounded-2xl text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${theme.btn}`}
             >
               Confirmar Ação
             </button>
             <button 
               onClick={onClose}
               className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-black hover:bg-muted/80 transition-all cursor-pointer"
             >
               Cancelar
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
