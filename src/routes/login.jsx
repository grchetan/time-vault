import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export const Route = createFileRoute('/login')({ component: LoginPage });

const provider = new GoogleAuthProvider();

const errMsg = (code) =>
  ({
    'auth/email-already-in-use': 'Yeh email pehle se registered hai.',
    'auth/invalid-email': 'Email sahi nahi hai.',
    'auth/weak-password': 'Password kam se kam 6 characters ka hona chahiye.',
    'auth/invalid-credential': 'Email ya password galat hai.',
    'auth/user-not-found': 'Is email pe koi account nahi mila.',
    'auth/wrong-password': 'Password galat hai.',
    'auth/too-many-requests': 'Bahut zyada attempts. Thodi der baad try karo.',
    'auth/popup-closed-by-user': 'Google login cancel ho gaya.',
  })[code] ?? 'Kuch galat hua. Dobara try karo.';

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/dashboard' });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email bhej diya Inbox check karo.');
        setLoading(false);
        return;
      }
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(cred.user, {
          displayName: name.trim() || email.split('@')[0],
        });
        toast.success('Welcome to TimeVault 🎉');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }
      navigate({ to: '/dashboard' });
    } catch (err) {
      toast.error(errMsg(err.code ?? ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate({ to: '/dashboard' });
    } catch (err) {
      toast.error(errMsg(err.code ?? ''));
    } finally {
      setGoogleLoading(false);
    }
  };

  const title =
    mode === 'login'
      ? 'Welcome back'
      : mode === 'signup'
        ? 'Create your vault'
        : 'Reset password';
  const subtitle =
    mode === 'login'
      ? 'Sign in to your TimeVault account'
      : mode === 'signup'
        ? 'Start locking distractions in 30 seconds'
        : 'Enter your email to get a reset link';
  const btnLabel = loading
    ? 'Please wait…'
    : mode === 'login'
      ? 'Sign in'
      : mode === 'signup'
        ? 'Create account'
        : 'Send reset email';

  return (
    <div className="container mx-auto max-w-md px-5 py-16">
      <div className="text-center mb-8">
        <div className="size-14 mx-auto rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
          <Lock className="size-7" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl bg-card border border-border p-7 shadow-card"
      >
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Shah"
              autoComplete="name"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        {mode !== 'forgot' && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'signup' ? 'Min. 6 characters' : 'Your password'
                }
                className="pr-10"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs"
              >
                {showPass ? '○' : '●'}
              </button>
            </div>
          </div>
        )}
        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={loading}
        >
          {btnLabel}
        </Button>

        {mode !== 'forgot' && (
          <>
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" className="mr-2">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              {googleLoading ? 'Please wait…' : 'Continue with Google'}
            </Button>
          </>
        )}
      </form>

      <p className="text-center text-sm mt-6 text-muted-foreground">
        {mode === 'login' && (
          <span>
            Don't have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </button>
          </span>
        )}
        {mode === 'signup' && (
          <span>
            Already have one?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </button>
          </span>
        )}
        {mode === 'forgot' && (
          <span>
            Remember it?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-primary font-medium hover:underline"
            >
              Back to login
            </button>
          </span>
        )}
      </p>
    </div>
  );
}
