import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Phone, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_MOBILES = ["9999999999", "6305462887"];
const MSG91_AUTH_KEY = "499149Atk4qYql269af942bP1";
const MSG91_TEMPLATE_ID = "69afa9e43d4d700e170bb6c2";
const MSG91_SENDER_ID = "GUCCOR";
const OTP_LENGTH = 4;

async function sendOTP(mobile: string): Promise<boolean> {
  try {
    const res = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        authkey: MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: `91${mobile}`,
        template_id: MSG91_TEMPLATE_ID,
        otp_length: OTP_LENGTH,
        sender: MSG91_SENDER_ID,
      }),
    });
    const data = await res.json();
    return data.type === "success";
  } catch {
    return false;
  }
}

async function verifyOTP(mobile: string, otp: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/otp/verify?mobile=91${mobile}&otp=${otp}&authkey=${MSG91_AUTH_KEY}`,
    );
    const data = await res.json();
    return data.type === "success";
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const completeLogin = async () => {
    if (!actor) {
      toast.error("Connecting to network...");
      setLoading(false);
      return;
    }
    try {
      const user = await actor.loginUserByMobile(mobile);
      setCurrentUser(user);

      let isAdmin = ADMIN_MOBILES.includes(mobile) || user.role === "admin";
      if (!isAdmin) {
        try {
          isAdmin = await actor.isCallerAdmin();
        } catch {
          // fallback already handled above
        }
      }

      toast.success(`Welcome back, ${user.name}!`);
      if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!actor) {
      toast.error("Connecting to network...");
      return;
    }
    setLoading(true);
    const sent = await sendOTP(mobile);
    setLoading(false);
    if (sent) {
      setOtpSent(true);
      toast.success("OTP sent to your mobile number");
    } else {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyAndLogin = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setLoading(true);
    const verified = await verifyOTP(mobile, otp);
    if (verified) {
      await completeLogin();
    } else {
      toast.error("Invalid OTP. Please try again.");
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
        <div className="flex justify-center mt-3 mb-2">
          <img
            src="/assets/uploads/file_0000000009d471fa834bd89a9a8b7499-1.png"
            alt="Guccora MLM Network"
            className="w-36 h-20 object-contain"
          />
        </div>
        <div className="mt-4 bg-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/70 text-sm">Your earnings are waiting</p>
          <p className="text-yellow-300 font-bold text-lg mt-0.5">
            Login to check your wallet
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
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
                data-ocid="login.input"
                placeholder="10-digit Indian mobile number"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setOtpSent(false);
                  setOtp("");
                }}
                inputMode="numeric"
                className="pl-10 h-12"
                disabled={otpSent}
              />
            </div>
          </div>

          {!otpSent ? (
            <Button
              data-ocid="login.send_otp_button"
              size="lg"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground font-semibold">
                  Enter OTP
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    data-ocid="login.otp_input"
                    placeholder={`${OTP_LENGTH}-digit OTP`}
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH),
                      )
                    }
                    inputMode="numeric"
                    className="pl-10 h-12 tracking-widest text-center text-lg font-bold"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleVerifyAndLogin()
                    }
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  OTP sent to +91-{mobile}.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-primary underline"
                  >
                    Change number
                  </button>
                </p>
              </div>

              <Button
                data-ocid="login.submit_button"
                size="lg"
                onClick={handleVerifyAndLogin}
                disabled={loading}
                className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <Button
                data-ocid="login.resend_button"
                variant="ghost"
                size="sm"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-primary"
              >
                Resend OTP
              </Button>
            </motion.div>
          )}
        </motion.div>
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
