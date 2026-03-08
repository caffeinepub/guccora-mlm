import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { formatINR } from "@/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  Loader2,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Company UPI Config ─────────────────────────────────────────────────────────

const COMPANY_UPI_ID = "guccora@paytm";

// ─── Plan Definitions (always rendered, matched to backend by name/price) ──────

interface PlanConfig {
  name: string;
  price: number;
  description: string;
  benefits: string[];
  gradient: string;
  badge: string;
  badgeVariant: "starter" | "popular" | "premium";
  icon: React.ReactNode;
  isHighlighted: boolean;
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    name: "Guccora Starter Plan",
    price: 599,
    description: "Starter product pack for MLM activation.",
    benefits: [
      "₹100 direct income per referral",
      "₹200 binary pair income",
      "Level income up to 10 levels",
      "Standard member access",
    ],
    gradient: "gradient-direct",
    badge: "Starter",
    badgeVariant: "starter",
    icon: <Zap className="w-6 h-6 text-white" />,
    isHighlighted: false,
  },
  {
    name: "Guccora Growth Plan",
    price: 999,
    description: "Medium product pack with higher earning potential.",
    benefits: [
      "₹150 direct income per referral",
      "₹300 binary pair income",
      "Level income up to 10 levels",
      "Growth member access",
    ],
    gradient: "gradient-binary",
    badge: "Popular",
    badgeVariant: "popular",
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    isHighlighted: true,
  },
  {
    name: "Guccora Premium Plan",
    price: 1999,
    description: "Premium product pack with maximum earning benefits.",
    benefits: [
      "₹300 direct income per referral",
      "₹600 binary pair income",
      "Level income up to 10 levels",
      "Premium member access",
    ],
    gradient: "gradient-primary",
    badge: "Premium",
    badgeVariant: "premium",
    icon: <Crown className="w-6 h-6 text-white" />,
    isHighlighted: false,
  },
];

// ─── Badge styles per tier ──────────────────────────────────────────────────────

const badgeStyles: Record<string, string> = {
  starter:
    "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold px-2 py-0.5 rounded-full",
  popular:
    "bg-amber-400/30 text-amber-100 border border-amber-300/40 text-xs font-bold px-2 py-0.5 rounded-full",
  premium:
    "bg-white/20 text-white border border-white/30 text-xs font-bold px-2 py-0.5 rounded-full",
};

// ─── UPI Payment Dialog ─────────────────────────────────────────────────────────

interface UpiPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  plan: PlanConfig | null;
  productId: bigint | null;
  userId: bigint | null;
}

function UpiPaymentDialog({
  open,
  onClose,
  plan,
  productId,
  userId,
}: UpiPaymentDialogProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [utrRef, setUtrRef] = useState("");
  const [copied, setCopied] = useState(false);

  const submitPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !userId || !productId) throw new Error("Not connected");
      if (!utrRef.trim()) throw new Error("Enter your UTR/transaction number");
      return actor.submitPaymentRequest(userId, productId, utrRef.trim());
    },
    onSuccess: () => {
      toast.success("Payment submitted! Awaiting admin confirmation.");
      queryClient.invalidateQueries({ queryKey: ["user-payments"] });
      setUtrRef("");
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Payment submission failed",
      );
    },
  });

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(COMPANY_UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    setUtrRef("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="products.upi_payment.dialog"
        className="max-w-sm rounded-3xl mx-4"
      >
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            UPI Payment
          </DialogTitle>
        </DialogHeader>

        {plan && (
          <div className="space-y-4">
            {/* Amount highlight */}
            <div
              className={`${plan.gradient} rounded-2xl p-4 text-white text-center`}
            >
              <p className="text-white/70 text-xs font-medium mb-1">
                Amount to Pay
              </p>
              <p className="font-display text-3xl font-black">
                {formatINR(plan.price)}
              </p>
              <p className="text-white/60 text-xs mt-1">{plan.name}</p>
            </div>

            {/* UPI ID section */}
            <div className="bg-muted rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pay to UPI ID
              </p>
              <div className="flex items-center justify-between gap-2 bg-background rounded-xl px-4 py-3 border border-border">
                <p className="font-mono text-lg font-bold text-primary tracking-wide">
                  {COMPANY_UPI_ID}
                </p>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Copy UPI ID"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay via any UPI app (PhonePe, GPay, Paytm, BHIM), then enter
                your UTR number below.
              </p>
            </div>

            {/* App icons for UPI */}
            <div className="flex items-center gap-2">
              {["PhonePe", "GPay", "Paytm", "BHIM"].map((app) => (
                <span
                  key={app}
                  className="flex-1 text-center text-[10px] font-semibold text-muted-foreground bg-muted rounded-lg py-1.5 border border-border"
                >
                  {app}
                </span>
              ))}
            </div>

            {/* UTR input */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                UTR / Transaction Reference
              </Label>
              <Input
                data-ocid="products.upi_ref.input"
                placeholder="Enter 12-digit UTR number"
                value={utrRef}
                onChange={(e) => setUtrRef(e.target.value)}
                className="h-12 font-mono text-base tracking-wider rounded-xl"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && utrRef.trim()) {
                    submitPaymentMutation.mutate();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Find the UTR in your UPI app under transaction history.
              </p>
            </div>

            {/* Pending note */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Your account will be activated once admin confirms the payment.
                Usually within a few hours.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            data-ocid="products.cancel_payment.cancel_button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={submitPaymentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            data-ocid="products.confirm_payment.submit_button"
            onClick={() => submitPaymentMutation.mutate()}
            disabled={submitPaymentMutation.isPending || !utrRef.trim()}
            className="flex-1 gradient-primary border-0 text-white font-bold rounded-xl"
          >
            {submitPaymentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── ProductsPage ───────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const { actor, isFetching } = useActor();
  const { currentUser } = useAppContext();

  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    plan: PlanConfig | null;
    productId: bigint | null;
  }>({ open: false, plan: null, productId: null });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });

  // Track user's pending payments to show pending badge
  const { data: userPayments } = useQuery({
    queryKey: ["user-payments", currentUser?.userId],
    queryFn: async () => {
      if (!actor || !currentUser) return [];
      return actor.getUserPayments(currentUser.userId);
    },
    enabled: !!actor && !isFetching && !!currentUser,
  });

  // Check if user has a pending payment for a given product
  const hasPendingPayment = (productId: bigint) => {
    return (userPayments ?? []).some(
      (p) =>
        p.productId === productId &&
        (p.status === "pending" || p.status === "confirmed"),
    );
  };

  // Match each plan config to a backend product by name or price
  const getMatchedProduct = (plan: PlanConfig) => {
    if (!products) return null;
    return (
      products.find(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(plan.name.toLowerCase()) ||
            plan.name.toLowerCase().includes(p.name.toLowerCase()) ||
            p.price === plan.price),
      ) ?? null
    );
  };

  const activeBackendProducts = products?.filter((p) => p.isActive) ?? [];
  const hasNoBackendProducts =
    !isLoading && (!products || activeBackendProducts.length === 0);

  const openPaymentDialog = (plan: PlanConfig, productId: bigint) => {
    setPaymentDialog({ open: true, plan, productId });
  };

  return (
    <div className="app-shell bg-background page-content">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="gradient-primary px-4 pt-14 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-white/70" />
            <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
              Guccora Plans
            </p>
          </div>
          <h1 className="font-display text-3xl font-black text-white leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Activate your account and start earning with MLM income
          </p>
        </motion.div>

        {/* Account activation status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          {currentUser?.isActive ? (
            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <p className="text-emerald-200 text-sm font-medium">
                Account Active — All incomes enabled
              </p>
            </div>
          ) : (
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-3 flex items-start gap-2">
              <Star className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-sm font-medium">
                Purchase any plan via UPI to activate your account and start
                earning
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Plan Cards ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-5 space-y-4">
        {/* No backend products note (doesn't block rendering) */}
        {hasNoBackendProducts && (
          <motion.div
            data-ocid="products.empty_state"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2"
          >
            <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800">
                Products not yet activated by admin
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Plans are displayed below. Ask admin to activate products to
                enable purchases.
              </p>
            </div>
          </motion.div>
        )}

        <TooltipProvider>
          {isLoading
            ? // Loading skeletons matching final card layout
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden shadow-sm border border-border"
                >
                  <Skeleton className="h-28 rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-12 rounded-xl mt-3" />
                  </div>
                </div>
              ))
            : PLAN_CONFIGS.map((plan, i) => {
                const matchedProduct = getMatchedProduct(plan);
                const canPurchase = !!matchedProduct;
                const ocidIndex = i + 1;
                const pendingForProduct =
                  matchedProduct && hasPendingPayment(matchedProduct.productId);

                return (
                  <motion.div
                    key={plan.name}
                    data-ocid={`products.item.${ocidIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className={`bg-card rounded-2xl overflow-hidden shadow-card ${
                      plan.isHighlighted
                        ? "ring-2 ring-blue-500/60 shadow-[0_0_0_2px_rgba(59,130,246,0.15),0_8px_32px_rgba(59,130,246,0.12)]"
                        : "border border-border"
                    }`}
                  >
                    {/* Most Popular banner */}
                    {plan.isHighlighted && (
                      <div className="gradient-binary text-center py-1.5">
                        <p className="text-white text-[11px] font-black tracking-widest uppercase">
                          ✦ Most Popular ✦
                        </p>
                      </div>
                    )}

                    {/* Card header with gradient */}
                    <div
                      className={`${plan.gradient} px-5 py-5 flex items-start justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                          {plan.icon}
                        </div>
                        <div>
                          <p className="text-white font-display font-bold text-lg leading-tight">
                            {plan.name}
                          </p>
                          <span className={badgeStyles[plan.badgeVariant]}>
                            {plan.badge}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-display text-2xl font-black">
                          {formatINR(plan.price)}
                        </p>
                        <p className="text-white/60 text-xs">one-time</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <p className="text-muted-foreground text-sm mb-3">
                        {plan.description}
                      </p>

                      {/* Benefits */}
                      <div className="space-y-2 mb-4">
                        {plan.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-center gap-2"
                          >
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-xs text-foreground font-medium">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Purchase / status button */}
                      {canPurchase ? (
                        currentUser?.isActive ? (
                          <Button
                            data-ocid={`products.buy_button.${ocidIndex}`}
                            disabled
                            className={`w-full h-12 border-0 text-white font-bold rounded-xl ${plan.gradient}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Account Active
                          </Button>
                        ) : pendingForProduct ? (
                          <div
                            data-ocid={`products.buy_button.${ocidIndex}`}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl"
                          >
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">
                              Payment Pending Confirmation
                            </span>
                          </div>
                        ) : (
                          <Button
                            data-ocid={`products.buy_button.${ocidIndex}`}
                            onClick={() =>
                              openPaymentDialog(plan, matchedProduct!.productId)
                            }
                            className={`w-full h-12 border-0 text-white font-bold rounded-xl ${plan.gradient}`}
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay via UPI — {formatINR(plan.price)}
                          </Button>
                        )
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div data-ocid={`products.buy_button.${ocidIndex}`}>
                              <Button
                                disabled
                                className="w-full h-12 border-0 rounded-xl font-bold"
                                variant="outline"
                              >
                                <ShoppingBag className="w-4 h-4 mr-2 opacity-40" />
                                Purchase — {formatINR(plan.price)}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Product not yet activated by admin
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                );
              })}
        </TooltipProvider>
      </div>

      {/* ── UPI Info Strip ───────────────────────────────────────────────────── */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-4 py-3">
          <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Payments via UPI to{" "}
            <span className="font-mono font-bold text-foreground">
              {COMPANY_UPI_ID}
            </span>
            . Account activates after admin confirmation.
          </p>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-8 pt-2">
        <p className="text-xs text-muted-foreground text-center">
          One-time product purchase. No hidden charges.
        </p>
      </div>

      {/* ── UPI Payment Dialog ───────────────────────────────────────────────── */}
      <UpiPaymentDialog
        open={paymentDialog.open}
        onClose={() =>
          setPaymentDialog({ open: false, plan: null, productId: null })
        }
        plan={paymentDialog.plan}
        productId={paymentDialog.productId}
        userId={currentUser?.userId ?? null}
      />
    </div>
  );
}
