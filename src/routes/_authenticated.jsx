import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' });
  }, [loading, user, navigate]);

  if (loading)
    return (
      <div className="container mx-auto max-w-6xl px-5 py-20 text-center text-muted-foreground">
        Loading…
      </div>
    );
  if (!user) return null;
  return <Outlet />;
}
