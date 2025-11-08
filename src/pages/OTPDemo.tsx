import { OTPLogin } from "@/components/OTPLogin";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const OTPDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-soft px-4">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">
          OTP Verification Demo
        </h1>
        <p className="text-muted-foreground">
          Test the email OTP verification system
        </p>
      </div>

      <OTPLogin />

      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p>
          This demo sends a 6-digit verification code to your email.
          The code expires in 10 minutes.
        </p>
      </div>
    </div>
  );
};

export default OTPDemo;
