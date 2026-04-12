import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../infrastructure/supabase';
import { useAuth } from './AuthContext';

const AccountContext = createContext({});

export const AccountProvider = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setActiveAccount(null);
    }
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data.length > 0) {
      setAccounts(data);
      // Set first account as active if none set
      if (!activeAccount) setActiveAccount(data[0]);
    }
    setLoading(false);
  };

  const createAccount = async (accountData) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ ...accountData, user_id: user.id }])
      .select();

    if (!error) {
      setAccounts([...accounts, data[0]]);
      if (!activeAccount) setActiveAccount(data[0]);
    }
    return { data, error };
  };

  const deleteAccount = async (id) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.filter(acc => acc.id !== id));
      if (activeAccount?.id === id) setActiveAccount(null);
    }
    return { error };
  };

  const fetchWithdrawals = async (filters = {}) => {
    if (!activeAccount) return { data: [], error: null };
    
    let query = supabase
      .from('withdrawals')
      .select('*')
      .eq('account_id', activeAccount.id)
      .order('date', { ascending: false });

    if (filters.startDate) query = query.gte('date', filters.startDate);
    if (filters.endDate) query = query.lte('date', filters.endDate);

    const { data, error } = await query;
    return { data, error };
  };

  const clearTrades = async (accountId) => {
    const targetId = accountId || activeAccount?.id;
    if (!targetId) return { error: 'No account specified' };

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('account_id', targetId);

    return { error };
  };

  const registerWithdrawal = async (amount, date = new Date().toISOString()) => {
    if (!activeAccount || !user) return { error: 'No active account' };

    // 1. Insert withdrawal record
    const { error: wError } = await supabase
      .from('withdrawals')
      .insert([{ 
        account_id: activeAccount.id, 
        user_id: user.id, 
        amount: amount,
        date: date
      }]);

    if (wError) return { error: wError };

    // 2. Reset account profit_target
    const { error: aError } = await supabase
      .from('accounts')
      .update({ profit_target: 0 })
      .eq('id', activeAccount.id);

    if (!aError) {
      setActiveAccount(prev => ({ ...prev, profit_target: 0 }));
      setAccounts(prev => prev.map(acc => 
        acc.id === activeAccount.id ? { ...acc, profit_target: 0 } : acc
      ));
    }

    return { error: aError };
  };

  return (
    <AccountContext.Provider value={{ 
      accounts, 
      activeAccount, 
      setActiveAccount, 
      createAccount, 
      deleteAccount,
      registerWithdrawal,
      fetchWithdrawals,
      clearTrades,
      loading, 
      refreshAccounts: fetchAccounts 
    }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);
