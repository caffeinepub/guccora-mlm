import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { formatDate, formatINR, getInitials } from "@/utils/format";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Copy,
  Link2,
  LogOut,
  Phone,
  Share2,
  Shield,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAppContext();

  if (!currentUser) {
    return (
      <div className="app-shell bg-background flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Please login to view profile</p>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}/register?ref=${currentUser.referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Guccora",
        text: `Join Guccora with my referral code: ${currentUser.referralCode}. Earn ₹100 direct income!`,
        url: referralUrl,
      });
    } else {
      handleCopyReferral();
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
    toast.success("Logged out successfully");
  };

  return (
    <div className="app-shell bg-background page-content">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-16">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-white">
            My Profile
          </h1>
          <Button
            data-ocid="profile.logout_button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Avatar Card (overlapping) */}
      <div className="px-4 -mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-card-lg"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white font-display text-xl font-black shrink-0">
              {getInitials(currentUser.name)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-foreground text-xl truncate">
                  {currentUser.name}
                </h2>
                {currentUser.isActive ? (
                  <Badge className="badge-direct text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  +91 {currentUser.mobile}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Joined {formatDate(currentUser.joinDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="mt-4 bg-secondary/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">Wallet Balance</p>
            <p className="font-display text-2xl font-black text-primary mt-0.5">
              {formatINR(currentUser.walletBalance)}
            </p>
          </div>
        </motion.div>

        {/* Referral Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-card border border-border rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Referral Code</h3>
          </div>

          {/* Code box */}
          <div className="bg-secondary/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-display text-xl font-black text-primary tracking-wider">
                {currentUser.referralCode}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 break-all">
                {referralUrl}
              </p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mt-3">
            <Button
              data-ocid="profile.copy_referral_button"
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={handleCopyReferral}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 h-12 gradient-primary border-0 text-white rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Income Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-card border border-border rounded-2xl p-4"
        >
          <h3 className="font-semibold text-foreground mb-3">Income Plan</h3>
          <div className="space-y-2">
            {[
              {
                label: "Direct Income",
                value: "₹100/referral",
                color: "badge-direct",
              },
              {
                label: "Binary Pair Income",
                value: "₹200/pair",
                color: "badge-binary",
              },
              {
                label: "Level Income",
                value: "Upto 10 levels",
                color: "badge-level",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${color}`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Admin link */}
        {currentUser.role === "admin" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-primary text-primary"
              onClick={() => navigate({ to: "/admin" })}
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
