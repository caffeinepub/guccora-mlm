import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Link2, Loader2, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const DEMO_OTP = "123456";

export default function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { ref?: string };
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sponsorCode, setSponsorCode] = useState(search.ref || "");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || name.length < 2) {
      toast.error("Please enter your full name");
      return;
    }
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
      const referralCode = `GUC${mobile.slice(-6)}`;

      // Generate OTP; fall back to demo OTP if generation fails
      let otpToUse = DEMO_OTP;
      try {
        const generated = await actor.generateOTP(mobile);
        otpToUse = generated || DEMO_OTP;
      } catch {
        otpToUse = DEMO_OTP;
      }

      const user = await actor.registerUser(
        name,
        mobile,
        referralCode,
        sponsorCode,
        otpToUse,
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
                data-ocid="register.name_input"
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

          <Button
            data-ocid="register.submit_button"
            size="lg"
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Register & Enter Dashboard"
            )}
          </Button>
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
