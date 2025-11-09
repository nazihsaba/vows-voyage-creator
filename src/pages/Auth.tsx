import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Shield, ArrowLeft, CheckCircle2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Use Supabase's built-in OTP (completely free!)
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (otpError) throw otpError;

      setStep('verify');
      setResendTimer(60); // 60 second cooldown before resend
      toast.success("Verification code sent! Check your email.");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        toast.error("Please enter a valid 6-digit code");
        return;
      }

      // Verify OTP using Supabase's built-in method
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: otp,
        type: 'email'
      });

      if (verifyError) {
        throw new Error(verifyError.message || "Invalid or expired verification code");
      }

      if (!data.session) {
        throw new Error("Failed to create session");
      }
      
      toast.success("Successfully logged in! Redirecting...");
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) throw error;
      setResendTimer(60);
      setOtp("");
      toast.success("New verification code sent!");
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        {step === "email" && (
          <>
            <CardHeader className="space-y-3 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Secure Login</CardTitle>
              <CardDescription className="text-base">
                Enter your email to receive a verification code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Verification Code
                    </>
                  )}
                </Button>
                <div className="text-center pt-2 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Secure passwordless authentication</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Code expires in 5 minutes</span>
                  </div>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "verify" && (
          <>
            <CardHeader className="space-y-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                className="absolute top-4 left-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription className="text-base">
                Enter the 6-digit code sent to<br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={loading}
                    className="h-11 text-center text-2xl tracking-widest font-mono"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Code expires in 5 minutes
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify & Login
                    </>
                  )}
                </Button>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={loading || resendTimer > 0}
                    className="text-sm"
                  >
                    {resendTimer > 0 
                      ? `Resend code in ${resendTimer}s` 
                      : "Resend verification code"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
