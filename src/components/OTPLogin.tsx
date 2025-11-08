import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, KeyRound } from "lucide-react";

export const OTPLogin = () => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email },
      });

      if (error) throw error;

      toast({
        title: "OTP Sent!",
        description: "Check your email for the verification code.",
      });
      setStep("verify");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
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
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code: otpCode },
      });

      if (error) throw error;
      
      if (!data?.success) {
        throw new Error(data?.error || "Invalid OTP code");
      }

      toast({
        title: "Success!",
        description: "OTP verified successfully.",
      });
      
      // Reset form
      setEmail("");
      setOtpCode("");
      setStep("email");
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

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email },
      });

      if (error) throw error;

      toast({
        title: "OTP Resent!",
        description: "Check your email for the new verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-elegant">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {step === "email" ? (
            <Mail className="w-12 h-12 text-primary" />
          ) : (
            <KeyRound className="w-12 h-12 text-primary" />
          )}
        </div>
        <CardTitle className="text-3xl font-serif">
          {step === "email" ? "Email Verification" : "Enter OTP Code"}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email to receive a verification code"
            : "Enter the 6-digit code sent to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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
              {loading ? "Sending..." : "Send OTP Code"}
            </Button>
          </form>
        ) : (
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
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setStep("email");
                  setOtpCode("");
                }}
                className="text-sm"
              >
                Change Email
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
      </CardContent>
    </Card>
  );
};
