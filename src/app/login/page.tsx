'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/atoms/button'; // Assumes shadcn/ui path
import { Input } from '@/components/atoms/input'; // Assumes shadcn/ui path
import { useState } from 'react';
import { Loader2, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type LoginStep = 'EMAIL' | 'OTP';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1: Request the OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, type: 'email' }),
      });

      if (!res.ok) throw new Error('Failed to send OTP');

      toast.success('Login code sent to your email');
      setStep('OTP');
    } catch (error) {
      toast.error('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Login
  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: email,
        code: otp,
        redirect: false,
        callbackUrl: '/dashboard',
      });
      console.log('54: ', result);

      if (result?.error) {
        toast.error('Invalid code. Please try again.');
        setLoading(false);
      } else {
        toast.success('Welcome back!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-background border rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            {step === 'EMAIL' ? (
              <Mail className="w-6 h-6 text-primary" />
            ) : (
              <Lock className="w-6 h-6 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {step === 'EMAIL' ? 'Welcome back' : 'Check your email'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 'EMAIL'
              ? 'Login to access your productivity workspace'
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Step 1: Email Form */}
        {step === 'EMAIL' && (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-11 relative"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <img
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google"
                className="w-5 h-5 absolute left-4"
              />
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with Email
                </span>
              </div>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Login Code
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Form */}
        {step === 'OTP' && (
          <form
            onSubmit={handleVerifyLogin}
            className="space-y-4 animate-in fade-in slide-in-from-right-8"
          >
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="h-11 text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading || otp.length < 6}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Login
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mx-auto mt-4"
              >
                <ArrowLeft className="w-3 h-3" /> Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



  
// useEffect(() => {
//   if (window.location.search.includes('error=')) {
//     router.replace('/login');
//   }
// }, []);
