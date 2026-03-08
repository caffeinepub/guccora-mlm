import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import {
  formatDateTime,
  formatINR,
  getTxBadgeClass,
  getTxTypeLabel,
} from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  Share2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { actor, isFetching } = useActor();
  const { currentUser } = useAppContext();

  const userId = currentUser?.userId;

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", String(userId)],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getWallet(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });

  const transactions = wallet?.transactions || [];
  const recentTxs = transactions.slice(0, 5);

  // Calculate income by type
  const directIncome = transactions
    .filter((t) => t.txType === "direct_income")
    .reduce((sum, t) => sum + t.amount, 0);
  const binaryIncome = transactions
    .filter((t) => t.txType === "binary_income")
    .reduce((sum, t) => sum + t.amount, 0);
  const levelIncome = transactions
    .filter((t) => t.txType === "level_income")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleShare = () => {
    const referralUrl = `${window.location.origin}/register?ref=${currentUser?.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: "Join Guccora",
        text: `Join Guccora with my referral code: ${currentUser?.referralCode}`,
        url: referralUrl,
      });
    } else {
      navigator.clipboard.writeText(referralUrl);
      toast.success("Referral link copied!");
    }
  };

  const incomeCards = [
    {
      label: "Direct Income",
      amount: directIncome,
      bg: "gradient-direct",
      icon: TrendingUp,
      description: "₹100 per referral",
    },
    {
      label: "Binary Income",
      amount: binaryIncome,
      bg: "gradient-binary",
      icon: TrendingUp,
      description: "₹200 per pair",
    },
    {
      label: "Level Income",
      amount: levelIncome,
      bg: "gradient-level",
      icon: TrendingUp,
      description: "10 levels",
    },
    {
      label: "Wallet Balance",
      amount: wallet?.balance ?? currentUser?.walletBalance ?? 0,
      bg: "gradient-wallet",
      icon: TrendingUp,
      description: "Available balance",
    },
  ];

  return (
    <div className="app-shell bg-background">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/uploads/file_000000003e8c71fab2239f767299f90d-1.png"
              alt="Guccora"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-white/60 text-sm">Good day,</p>
              <h1 className="font-display text-2xl font-bold text-white">
                {currentUser?.name?.split(" ")[0] || "Member"} 👋
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser?.isActive ? (
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-400/30">
                Active
              </span>
            ) : (
              <span className="bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-1 rounded-full border border-red-400/30">
                Inactive
              </span>
            )}
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wallet balance hero */}
        <div className="mt-4 bg-white/10 rounded-2xl p-4">
          <p className="text-white/60 text-xs">Total Wallet Balance</p>
          {walletLoading || isFetching ? (
            <Skeleton className="h-8 w-32 mt-1 bg-white/20" />
          ) : (
            <p className="text-white font-display text-3xl font-black">
              {formatINR(wallet?.balance ?? currentUser?.walletBalance ?? 0)}
            </p>
          )}
          <p className="text-white/50 text-xs mt-1">
            Referral: {currentUser?.referralCode}
          </p>
        </div>
      </div>

      {/* Income Cards Grid */}
      <div className="px-4 py-4 page-content">
        <h2 className="font-display font-bold text-foreground mb-3">
          Income Summary
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {incomeCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${card.bg} rounded-2xl p-4 text-white`}
            >
              <p className="text-white/70 text-xs font-medium">{card.label}</p>
              {walletLoading ? (
                <Skeleton className="h-6 w-20 mt-1 bg-white/20" />
              ) : (
                <p className="font-display text-xl font-bold mt-0.5">
                  {formatINR(card.amount)}
                </p>
              )}
              <p className="text-white/50 text-[10px] mt-1">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="font-display font-bold text-foreground mt-5 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            data-ocid="dashboard.share_referral_button"
            onClick={handleShare}
            className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-4 touch-target"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground text-center">
              Share Referral
            </span>
          </button>

          <Link to="/wallet" className="block">
            <button
              type="button"
              data-ocid="dashboard.withdraw_button"
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-4 w-full touch-target"
            >
              <div className="w-10 h-10 gradient-level rounded-xl flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center">
                Withdraw
              </span>
            </button>
          </Link>

          <Link to="/products" className="block">
            <button
              type="button"
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-4 w-full touch-target"
            >
              <div className="w-10 h-10 gradient-binary rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center">
                Products
              </span>
            </button>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h2 className="font-display font-bold text-foreground">
            Recent Transactions
          </h2>
          <Link
            to="/wallet"
            className="text-primary text-xs font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {walletLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : recentTxs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs mt-1">Start referring to earn income</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx, i) => (
              <motion.div
                key={String(tx.txId)}
                data-ocid={i === 0 ? "dashboard.transaction.item.1" : undefined}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${getTxBadgeClass(
                      tx.txType,
                    )}`}
                  >
                    {tx.txType === "direct_income" && "D"}
                    {tx.txType === "binary_income" && "B"}
                    {tx.txType === "level_income" && "L"}
                    {tx.txType === "withdrawal" && "W"}
                    {tx.txType === "joining" && "J"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {getTxTypeLabel(tx.txType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-bold ${
                    tx.txType === "withdrawal"
                      ? "text-destructive"
                      : "text-emerald-600"
                  }`}
                >
                  {tx.txType === "withdrawal" ? "-" : "+"}
                  {formatINR(tx.amount)}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
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
