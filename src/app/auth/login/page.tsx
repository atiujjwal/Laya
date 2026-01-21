"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Triggers the custom OTP flow we built in Phase 4
    await signIn("credentials", {
      identifier: email,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="w-full max-w-md bg-background border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">
            Login to access your workspace
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <img
              src="https://authjs.dev/img/providers/google.svg"
              className="w-5 h-5 mr-3"
            />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with Email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Login Code
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
