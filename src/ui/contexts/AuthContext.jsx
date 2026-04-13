import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../infrastructure/supabase';
import ProcessingOverlay from '../components/ProcessingOverlay';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProfile = async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (!error && data) {
      setUser({ 
        ...sessionUser, 
        profile: data,
        isAdmin: data.subscription_status === 'admin'
      });
    } else {
      setUser({ ...sessionUser, profile: null }); // Fallback
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, affiliateId = null) => 
    supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          affiliate_id: affiliateId
        }
      }
    });

  const subscribe = async (priceId, hasAffiliate = false) => {
    try {
      setIsProcessing(true);

      // Refresh session so the Supabase client has a fresh token
      await supabase.auth.refreshSession();

      // Verify session exists
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      // The Supabase client automatically injects the Authorization header
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, hasAffiliate },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error.message);
      alert('Não foi possível iniciar o checkout. Tente novamente.');
      setIsProcessing(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setIsProcessing(true);

      // Refresh so the Supabase client has a fresh token (auto-injected)
      await supabase.auth.refreshSession();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado.');

      const { data, error } = await supabase.functions.invoke('create-portal-link');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erro ao acessar portal:', error.message);
      alert('Não foi possível acessar o portal de gestão. Tente novamente.');
      setIsProcessing(false);
    }
  };

  const refreshProfile = () => fetchProfile(user);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      subscribe,
      manageSubscription,
      refreshProfile,
      isProcessing,
      isAdmin: user?.isAdmin 
    }}>
      {children}
      {isProcessing && <ProcessingOverlay />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
