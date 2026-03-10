import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { triggerOtpWidget } from "@/lib/msg91";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const ADMIN_MOBILES = ["9999999999", "6305462887"];
const MSG91_WIDGET_ID = "366369725570373638343930";

export default function LoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const completeLogin = async (verifiedMobile: string) => {
    if (!actor) {
      toast.error("Connecting to network...");
      setLoading(false);
      return;
    }
    try {
      const user = await actor.loginUserByMobile(verifiedMobile);
      setCurrentUser(user);

      let isAdmin =
        ADMIN_MOBILES.includes(verifiedMobile) || user.role === "admin";
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

  const handleSendOTP = () => {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    if (!actor) {
      toast.error("Connecting to network...");
      return;
    }

    setLoading(true);

    triggerOtpWidget(
      {
        widgetId: MSG91_WIDGET_ID,
        identifier: `91${mobile}`,
        success: (data: unknown) => {
          console.log("MSG91 OTP success", data);
          completeLogin(mobile);
        },
        failure: (error: unknown) => {
          console.error("MSG91 OTP failure", error);
          toast.error("OTP verification failed. Please try again.");
          setLoading(false);
        },
      },
      () => {
        // Script never loaded after 10 seconds
        toast.error("OTP service unavailable. Please try again.");
        setLoading(false);
      },
    );

    // Reset loading immediately — MSG91 widget manages its own popup UI
    setLoading(false);
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
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                inputMode="numeric"
                className="pl-10 h-12"
              />
            </div>
          </div>

          <Button
            data-ocid="login.send_otp_button"
            size="lg"
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full h-14 text-base font-bold rounded-2xl gradient-primary border-0 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Opening OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
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
