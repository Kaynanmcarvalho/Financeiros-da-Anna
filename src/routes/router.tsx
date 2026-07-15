import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const PlanningPage = lazy(() => import('@/pages/PlanningPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'lancar',
        element: (
          <SuspenseWrapper>
            <TransactionsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'planejar',
        element: (
          <SuspenseWrapper>
            <PlanningPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'desejos',
        element: (
          <SuspenseWrapper>
            <PlanningPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'lembretes',
        element: (
          <SuspenseWrapper>
            <PlanningPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'relatorios',
        element: (
          <SuspenseWrapper>
            <ReportsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'perfil',
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
];

const publicRoutes: RouteObject[] = [
  {
    element: (
      <PublicOnlyRoute>
        <AuthLayout />
      </PublicOnlyRoute>
    ),
    children: [
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'cadastro',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'recuperar-senha',
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter([...protectedRoutes, ...publicRoutes]);
