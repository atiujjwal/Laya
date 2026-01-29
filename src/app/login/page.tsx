'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // Import client-side signIn
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Sun, Chrome, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { generateAndSendOTP } from '@/app/actions'; // Import the server action

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the server action to generate/send email
      const result = await generateAndSendOTP(email);

      if (result.success) {
        setStep('otp');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP via NextAuth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Calls the Credentials provider in auth.ts
      const result = await signIn('credentials', {
        identifier: email,
        code: otp,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid OTP. Please check your code.');
      } else {
        router.push('/dashboard'); // Redirect on success
        router.refresh();
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Social Login
  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {step === 'email' ? 'Welcome back to Laya' : 'Check your inbox'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email to sign in to your account'
              : `We've sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {/* Social Buttons - Only visible in Step 1 */}
          {step === 'email' && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  <span className="font-bold">G</span>
                  Github
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Login Form */}
          <form
            onSubmit={step === 'email' ? handleSendOtp : handleLogin}
            className="grid gap-4"
          >
            {step === 'email' ? (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="1AB23C"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.toUpperCase())}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground opacity-50" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 'email' ? 'Send Code' : 'Verify & Login'}
            </Button>
          </form>

          {/* Back button for Step 2 */}
          {step === 'otp' && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('email');
                setError('');
                setOtp('');
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Change Email
            </Button>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="px-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Footer Links */}
      <div className="absolute bottom-4 text-xs text-muted-foreground flex gap-4">
        <Link href="#" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="#" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
