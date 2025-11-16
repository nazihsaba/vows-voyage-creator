import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success("Successfully logged in!");
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Check your email for the login link!");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {emailSent ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <Lock className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-serif">
            {emailSent ? "Check Your Email" : "Welcome"}
          </CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? `We sent a verification link to ${email}`
              : "Enter your email to receive a sign-in link"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  <>
                    Send Sign-In Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Verification link sent</p>
                    <p className="text-sm text-muted-foreground">
                      Click the link in your email to sign in. The link will expire in 1 hour.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTryAgain}
                  className="w-full"
                >
                  Try Different Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;