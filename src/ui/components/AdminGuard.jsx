import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const AdminGuard = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-6">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Esta área é restrita apenas para administradores do sistema. Se você acredita que isso é um erro, entre em contato com o suporte.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  return children;
};
