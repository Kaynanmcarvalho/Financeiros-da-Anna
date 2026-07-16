import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { PageLoader } from '@/components/ui/PageLoader';
import type { ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: RouteGuardProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading || (user && !userProfile)) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile?.blocked) {
    return <Navigate to="/bloqueado" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: RouteGuardProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading || (user && !userProfile)) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile?.blocked) {
    return <Navigate to="/bloqueado" replace />;
  }

  if (userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: RouteGuardProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading || (user && !userProfile)) {
    return <PageLoader />;
  }

  if (userProfile?.blocked) {
    return <Navigate to="/bloqueado" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
