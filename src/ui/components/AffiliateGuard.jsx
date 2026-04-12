import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AffiliateGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="text-primary animate-spin" size={48} />
      </div>
    );
  }

  if (!user?.profile?.is_affiliate) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
