import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { triggerOtpWidget } from "@/lib/msg91";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Link2, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const MSG91_WIDGET_ID = "366369725570373638343930";

export default function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ref?: string };
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sponsorCode, setSponsorCode] = useState(search.ref || "");

  const doRegister = async (verifiedMobile: string) => {
    if (!actor) {
      toast.error("Connecting to network...");
      return;
    }
    try {
      const referralCode = `GUC${verifiedMobile.slice(-6)}`;
      const user = await actor.registerUser(
        name,
        verifiedMobile,
        referralCode,
        sponsorCode,
        "",
      );
      setCurrentUser(user);
      toast.success("Account created! Welcome to Guccora.");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleSendOTP = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      toast.error("Enter at least 10 digits for mobile number");
      return;
    }

    triggerOtpWidget(
      {
        widgetId: MSG91_WIDGET_ID,
        identifier: `91${mobile}`,
        success: (data: unknown) => {
          console.log("MSG91 OTP success", data);
          doRegister(mobile);
        },
        failure: (error: unknown) => {
          console.error("MSG91 OTP failure", error);
          toast.error("OTP verification failed. Please try again.");
        },
      },
      () => {
        toast.error("OTP service unavailable. Please try again.");
      },
    );
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
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                inputMode="numeric"
                className="pl-10 h-12"
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

          <button
            data-ocid="register.send_otp_button"
            type="button"
            onClick={handleSendOTP}
            style={{ pointerEvents: "auto", touchAction: "manipulation" }}
            className="w-full h-14 text-base font-bold rounded-2xl gradient-primary text-white cursor-pointer select-none"
          >
            Send OTP to Verify
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Enter your name and mobile number to continue
          </p>
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
