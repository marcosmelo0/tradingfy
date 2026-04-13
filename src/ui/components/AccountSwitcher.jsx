import React from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { ChevronDown, Wallet } from 'lucide-react';

export const AccountSwitcher = () => {
  const { accounts, activeAccount, setActiveAccount } = useAccounts();
  const [isOpen, setIsOpen] = React.useState(false);

  if (accounts.length === 0) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-sm font-semibold cursor-pointer w-fit"
      >
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <Wallet size={16} />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-muted-foreground uppercase leading-none mb-0.5">Conta</p>
          <p className="leading-tight">{activeAccount?.name || 'Selecionar'}</p>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-[calc(100vw-3rem)] sm:w-64 bg-card border border-border p-2 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 border-b border-border/50 mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suas Contas</p>
            </div>
            {accounts.map(acc => (
              <button
                key={acc.id}
                onClick={() => {
                  setActiveAccount(acc);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-colors mb-1 cursor-pointer flex items-center justify-between group ${
                  activeAccount?.id === acc.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                <div>
                  <p className="text-sm font-bold">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground">Mesa: {acc.initial_margin.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}</p>
                </div>
                {activeAccount?.id === acc.id && <div className="w-2 h-2 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
