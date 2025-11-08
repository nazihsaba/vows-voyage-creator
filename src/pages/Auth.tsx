import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Mail, KeyRound } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "verify" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if email or username already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email, username")
        .or(`email.ilike.${email},username.eq.${username}`)
        .maybeSingle();

      if (existingProfile) {
        if (existingProfile.email.toLowerCase() === email.toLowerCase()) {
          throw new Error("Email already registered");
        }
        if (existingProfile.username === username) {
          throw new Error("Username already taken");
        }
      }

      // Send OTP
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email, userName: username },
      });

      if (error) throw error;

      toast({
        title: "Verification Code Sent!",
        description: "Check your email for the verification code.",
      });
      setMode("verify");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify OTP
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-otp", {
        body: { email, code: otpCode },
      });

      if (verifyError) throw verifyError;
      
      if (!verifyData?.success) {
        throw new Error(verifyData?.error || "Invalid OTP code");
      }

      // Create the account
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Account Created!",
        description: "You can now log in with your credentials.",
      });
      
      setMode("login");
      setOtpCode("");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent!",
        description: "Check your email for the password reset link.",
      });
      
      setMode("login");
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to send reset link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email, userName: username },
      });

      if (error) throw error;

      toast({
        title: "Code Resent!",
        description: "Check your email for the new verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {mode === "verify" ? (
              <KeyRound className="w-12 h-12 text-primary" />
            ) : (
              <Heart className="w-12 h-12 text-primary" />
            )}
          </div>
          <CardTitle className="text-3xl font-serif">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "verify" && "Verify Email"}
            {mode === "reset" && "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === "login" && "Sign in to your account"}
            {mode === "signup" && "Create a new account to get started"}
            {mode === "verify" && "Enter the 6-digit code sent to your email"}
            {mode === "reset" && "Enter your email to receive a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="flex flex-col gap-2 text-center text-sm">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode("reset")}
                  className="text-sm"
                >
                  Forgot password?
                </Button>
                <div className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode("signup")}
                    className="text-sm p-0 h-auto"
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode("login")}
                  className="text-sm p-0 h-auto"
                >
                  Sign in
                </Button>
              </div>
            </form>
          )}

          {mode === "verify" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Code sent to {email}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setMode("signup");
                    setOtpCode("");
                  }}
                  className="text-sm"
                >
                  Change Details
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm"
                >
                  Resend Code
                </Button>
              </div>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode("login")}
                  className="text-sm"
                >
                  Back to login
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;