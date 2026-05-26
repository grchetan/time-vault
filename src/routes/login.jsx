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
import { Lock, Eye, EyeOff, Mail, User, ArrowLeft, Shield, Clock, CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/login')({ component: LoginPage });

const provider = new GoogleAuthProvider();

const errMsg = (code) =>
  ({
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  })[code] ?? 'Something went wrong. Please try again.';

/* Social proof perks shown on left panel */
const perks = [
  { icon: Lock, text: 'AES-256 encrypted passwords' },
  { icon: Clock, text: 'Server-side unlock timers' },
  { icon: Shield, text: 'Zero-knowledge vault' },
  { icon: CheckCircle, text: 'Free forever, no credit card' },
];

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
        toast.success('Password reset email sent — check your inbox.');
        setLoading(false);
        return;
      }
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, {
          displayName: name.trim() || email.split('@')[0],
        });
        toast.success('Welcome to TimeVault! Your vault is ready.');
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

  const titles = {
    login: { heading: 'Welcome back', sub: 'Sign in to your TimeVault account' },
    signup: { heading: 'Create your vault', sub: 'Start locking distractions in 30 seconds' },
    forgot: { heading: 'Reset password', sub: 'Enter your email to get a reset link' },
  };
  const { heading, sub } = titles[mode];

  const btnLabel = loading
    ? 'Please wait…'
    : mode === 'login' ? 'Sign in'
    : mode === 'signup' ? 'Create account'
    : 'Send reset email';

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex">
      {/* Left panel — decorative, hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 size-64 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-56 rounded-full bg-white/10 translate-x-1/2 translate-y-1/2 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-40 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 font-bold text-xl text-white mb-2">
            <div className="size-9 rounded-xl bg-white/20 grid place-items-center">
              <Lock className="size-5 text-white" />
            </div>
            TimeVault
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Reclaim your time.<br />
            One lock at a time.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Join people who've chosen to lock distraction behind a server-enforced timer.
          </p>
          <div className="space-y-3 pt-2">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <div className="size-7 rounded-lg bg-white/15 grid place-items-center flex-shrink-0">
                  <Icon className="size-3.5" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} TimeVault
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Mode header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="size-14 mx-auto rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-glow mb-5 animate-pulse-glow">
              <Lock className="size-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="card-premium p-7 space-y-4 animate-slide-up"
            style={{ animationDelay: '0.05s' }}
          >
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Shah"
                    autoComplete="name"
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-9"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="auth-password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                    className="pl-9 pr-10"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full bg-gradient-primary hover:opacity-90 shadow-soft transition-all duration-200"
              disabled={loading}
            >
              {btnLabel}
            </Button>

            {mode !== 'forgot' && (
              <>
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground px-1">or</span>
                  <div className="flex-1 border-t border-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full hover:border-primary/30 hover:bg-primary-soft/30 transition-all duration-200"
                  onClick={handleGoogle}
                  disabled={googleLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 48 48" className="mr-2 flex-shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  {googleLoading ? 'Signing in…' : 'Continue with Google'}
                </Button>
              </>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </button>
            )}
          </form>

          {/* Mode switcher */}
          <p className="text-center text-sm mt-6 text-muted-foreground animate-fade-in">
            {mode === 'login' && (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up free
                </button>
              </span>
            )}
            {mode === 'signup' && (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
