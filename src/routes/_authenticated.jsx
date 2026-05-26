import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
});

function AuthSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-col items-center justify-center gap-5 py-20">
        <div className="relative">
          <div className="size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center">
            <Lock className="size-7" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-primary/20 animate-spin-slow" />
        </div>
        <div className="space-y-2 text-center">
          <div className="skeleton h-3 w-32 mx-auto" />
          <div className="skeleton h-2.5 w-20 mx-auto delay-100" />
        </div>
      </div>
    </div>
  );
}

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/login' });
  }, [loading, user, navigate]);

  if (loading) return <AuthSkeleton />;
  if (!user) return null;
  return <Outlet />;
}
