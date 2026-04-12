import React from 'react';
import { useAccounts } from '../contexts/AccountContext';
import { ChevronDown, Wallet } from 'lucide-react';

export const AccountSwitcher = () => {
  const { accounts, activeAccount, setActiveAccount } = useAccounts();

  if (accounts.length === 0) return null;

  return (
    <div className="relative group">
      <button className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl hover:border-primary/50 transition-all text-sm font-semibold cursor-pointer">
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          <Wallet size={16} />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-muted-foreground uppercase leading-none mb-0.5">Conta</p>
          <p className="leading-tight">{activeAccount?.name || 'Selecionar'}</p>
        </div>
        <ChevronDown size={16} className="text-muted-foreground ml-2" />
      </button>

      <div className="absolute right-0 mt-2 w-56 bg-card border border-border p-2 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setActiveAccount(acc)}
            className={`w-full text-left p-3 rounded-xl transition-colors mb-1 cursor-pointer ${
              activeAccount?.id === acc.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            <p className="text-sm font-bold">{acc.name}</p>
            <p className="text-[10px] text-muted-foreground">Mesa: {acc.initial_margin.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
