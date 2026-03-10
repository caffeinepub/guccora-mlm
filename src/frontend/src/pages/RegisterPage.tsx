import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Link2,
  Loader2,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MSG91_AUTH_KEY = "499149Atk4qYql269af942bP1";
const MSG91_TEMPLATE_ID = "69afa9e43d4d700e170bb6c2";
const MSG91_SENDER = "GUCCOR";
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
        sender: MSG91_SENDER,
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ref?: string };
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sponsorCode, setSponsorCode] = useState(search.ref || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const doRegister = async (verifiedOtp: string) => {
    if (!actor) {
      toast.error("Connecting to network...");
      setLoading(false);
      return;
    }
    try {
      const referralCode = `GUC${mobile.slice(-6)}`;
      const user = await actor.registerUser(
        name,
        mobile,
        referralCode,
        sponsorCode,
        verifiedOtp,
      );
      setCurrentUser(user);
      toast.success("Account created! Welcome to Guccora.");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error("Please enter your full name first");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!actor) {
      toast.error("Connecting to network...");
      return;
    }
    setLoading(true);
    toast.loading("Sending OTP...", { id: "otp-send" });
    const sent = await sendOTP(mobile);
    toast.dismiss("otp-send");
    setLoading(false);
    if (sent) {
      setOtpSent(true);
      toast.success(`OTP sent to +91-${mobile}`);
    } else {
      toast.error(
        "Failed to send OTP. Please check your number and try again.",
      );
    }
  };

  const handleVerifyAndRegister = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit OTP`);
      return;
    }
    setLoading(true);
    const verified = await verifyOTP(mobile, otp);
    if (verified) {
      await doRegister(otp);
    } else {
      toast.error("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-10">
        <div className="flex items-center gap-3 mb-2">
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
              Create Account
            </h1>
            <p className="text-white/60 text-sm">Join Guccora Network</p>
          </div>
        </div>
        <div className="flex justify-center mt-3 mb-2">
          <img
            src="/assets/uploads/file_0000000009d471fa834bd89a9a8b7499-1.png"
            alt="Guccora MLM Network"
            className="w-36 h-20 object-contain"
          />
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                data-ocid="register.input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12"
                disabled={otpSent}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-foreground font-semibold">
              Mobile Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="mobile"
                data-ocid="register.mobile_input"
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

          <div className="space-y-2">
            <Label htmlFor="sponsor" className="text-foreground font-semibold">
              Sponsor Referral Code{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sponsor"
                data-ocid="register.referral_input"
                placeholder="Enter sponsor code (if any)"
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value.toUpperCase())}
                className="pl-10 h-12"
                disabled={otpSent}
              />
            </div>
            {sponsorCode && (
              <p className="text-xs text-muted-foreground">
                Joining under:{" "}
                <span className="font-semibold text-primary">
                  {sponsorCode}
                </span>
              </p>
            )}
          </div>

          {!otpSent ? (
            <Button
              data-ocid="register.send_otp_button"
              size="lg"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP to Verify"
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
                    data-ocid="register.otp_input"
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
                      e.key === "Enter" && handleVerifyAndRegister()
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
                    Change
                  </button>
                </p>
              </div>

              <Button
                data-ocid="register.submit_button"
                size="lg"
                onClick={handleVerifyAndRegister}
                disabled={loading}
                className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Register"
                )}
              </Button>

              <Button
                data-ocid="register.resend_button"
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

      {/* Already have account */}
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
