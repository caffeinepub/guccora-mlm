import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Info, Loader2, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    if (!actor) {
      toast.error("Connecting to network...");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.generateOTP(mobile);
      setGeneratedOtp(result);
      setStep("otp");
      toast.success("OTP sent successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }
    if (!actor) return;
    setLoading(true);
    try {
      const user = await actor.loginUser(mobile, otp);
      setCurrentUser(user);

      // Check if admin
      const isAdmin = await actor.isCallerAdmin();
      toast.success(`Welcome back, ${user.name}!`);
      if (isAdmin || user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Login failed. Check your OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Welcome Back
            </h1>
            <p className="text-white/60 text-sm">Login to Guccora</p>
          </div>
        </div>

        {/* Brand mark */}
        <div className="mt-4 bg-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/70 text-sm">Your earnings are waiting</p>
          <p className="text-yellow-300 font-bold text-lg mt-0.5">
            Login to check your wallet
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        {step === "mobile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-foreground font-semibold">
                Mobile Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="mobile"
                  data-ocid="login.mobile_input"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  inputMode="numeric"
                  className="pl-10 h-12"
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>
            </div>

            <Button
              data-ocid="login.send_otp_button"
              size="lg"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <p className="text-foreground font-semibold">OTP sent to</p>
              <p className="text-primary font-bold text-lg">+91 {mobile}</p>
            </div>

            {/* Demo OTP display */}
            {generatedOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-amber-800 text-sm">
                  Demo OTP:{" "}
                  <span className="font-bold tracking-widest">
                    {generatedOtp}
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                data-ocid="login.otp_input"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              data-ocid="login.submit_button"
              size="lg"
              onClick={handleLogin}
              disabled={loading || otp.length !== 6}
              className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground"
              onClick={() => {
                setOtp("");
                setStep("mobile");
                setGeneratedOtp("");
              }}
            >
              Change mobile number
            </button>
          </motion.div>
        )}
      </div>

      {/* Register link */}
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">
          New to Guccora?{" "}
          <Link to="/register" className="text-primary font-semibold">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
