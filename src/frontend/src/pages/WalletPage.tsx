import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import {
  formatDateTime,
  formatINR,
  getTxBadgeClass,
  getTxTypeLabel,
} from "@/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function WalletPage() {
  const { actor, isFetching } = useActor();
  const { currentUser } = useAppContext();
  const queryClient = useQueryClient();

  const userId = currentUser?.userId;

  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet", String(userId)],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getWallet(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });

  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["withdrawals", String(userId)],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getWithdrawalRequests(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !userId) throw new Error("Not connected");
      const amount = Number.parseFloat(withdrawForm.amount);
      if (Number.isNaN(amount) || amount < 100)
        throw new Error("Minimum withdrawal is ₹100");
      if (amount > (wallet?.balance || 0))
        throw new Error("Insufficient balance");
      if (!withdrawForm.bankName && !withdrawForm.upiId) {
        throw new Error("Enter bank details or UPI ID");
      }
      await actor.requestWithdrawal(
        userId,
        amount,
        withdrawForm.bankName,
        withdrawForm.accountNumber,
        withdrawForm.ifscCode,
        withdrawForm.upiId,
      );
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted!");
      setShowWithdrawSheet(false);
      setWithdrawForm({
        amount: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["wallet", String(userId)] });
      queryClient.invalidateQueries({
        queryKey: ["withdrawals", String(userId)],
      });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Withdrawal request failed",
      );
    },
  });

  const transactions = wallet?.transactions || [];

  const getWithdrawalStatusColor = (status: string) => {
    if (status === "approved")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="app-shell bg-background page-content">
      {/* Header */}
      <div className="gradient-wallet px-4 pt-14 pb-8">
        <h1 className="font-display text-2xl font-bold text-white">
          My Wallet
        </h1>
        <p className="text-white/60 text-sm mt-1">Track your earnings</p>

        {/* Balance Card */}
        <motion.div
          data-ocid="wallet.balance_card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-5"
        >
          <p className="text-white/60 text-sm">Available Balance</p>
          {walletLoading ? (
            <Skeleton className="h-10 w-40 mt-1 bg-white/20" />
          ) : (
            <p className="font-display text-4xl font-black text-white mt-1">
              {formatINR(wallet?.balance ?? 0)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <Wallet className="w-4 h-4 text-white/50" />
            <span className="text-white/50 text-xs">
              Earnings wallet • ID: {String(userId)?.slice(-6)}
            </span>
          </div>
        </motion.div>

        {/* Withdraw Button */}
        <Button
          data-ocid="wallet.withdraw_button"
          onClick={() => setShowWithdrawSheet(true)}
          className="w-full mt-4 h-12 bg-white text-brand-violet font-bold rounded-xl hover:bg-white/90 border-0"
        >
          <ArrowDownToLine className="w-4 h-4 mr-2" />
          Request Withdrawal
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs defaultValue="transactions">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="transactions"
              data-ocid="wallet.transactions_tab"
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger value="withdrawals" data-ocid="wallet.withdrawals_tab">
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            {walletLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                data-ocid="wallet.transactions.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No transactions yet</p>
                <p className="text-sm mt-1">Your earnings will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <motion.div
                    key={String(tx.txId)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTxBadgeClass(tx.txType)}`}
                      >
                        {tx.txType === "withdrawal" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {getTxTypeLabel(tx.txType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(tx.timestamp)}
                        </p>
                        {tx.note && (
                          <p className="text-xs text-muted-foreground">
                            {tx.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-sm ${
                          tx.txType === "withdrawal"
                            ? "text-destructive"
                            : "text-emerald-600"
                        }`}
                      >
                        {tx.txType === "withdrawal" ? "-" : "+"}
                        {formatINR(tx.amount)}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getTxBadgeClass(tx.txType)}`}
                      >
                        {tx.txType.replace(/_/g, " ")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-4">
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div
                data-ocid="wallet.withdrawals.empty_state"
                className="text-center py-12 text-muted-foreground"
              >
                <ArrowDownToLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No withdrawal requests</p>
                <p className="text-sm mt-1">
                  Request a withdrawal to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wr) => (
                  <div
                    key={String(wr.reqId)}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-foreground">
                          {formatINR(wr.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {wr.bankName
                            ? `${wr.bankName} • ${wr.accountNumber}`
                            : `UPI: ${wr.upiId}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(wr.requestDate)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs font-semibold ${getWithdrawalStatusColor(wr.status)}`}
                        variant="outline"
                      >
                        {wr.status}
                      </Badge>
                    </div>
                    {wr.adminNote && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted rounded-lg p-2">
                        Note: {wr.adminNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdrawal Sheet */}
      <Sheet open={showWithdrawSheet} onOpenChange={setShowWithdrawSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl max-h-[90vh] overflow-y-auto"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="font-display">Request Withdrawal</SheetTitle>
            <SheetDescription>
              Available balance:{" "}
              <span className="font-bold text-primary">
                {formatINR(wallet?.balance ?? 0)}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 pb-8">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                data-ocid="wallet.withdrawal_form.amount_input"
                type="number"
                placeholder="Minimum ₹100"
                value={withdrawForm.amount}
                onChange={(e) =>
                  setWithdrawForm((p) => ({ ...p, amount: e.target.value }))
                }
                className="h-12"
              />
            </div>

            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Bank Details
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Bank Name"
                  value={withdrawForm.bankName}
                  onChange={(e) =>
                    setWithdrawForm((p) => ({ ...p, bankName: e.target.value }))
                  }
                  className="h-12"
                />
                <Input
                  placeholder="Account Number"
                  value={withdrawForm.accountNumber}
                  onChange={(e) =>
                    setWithdrawForm((p) => ({
                      ...p,
                      accountNumber: e.target.value,
                    }))
                  }
                  className="h-12"
                  inputMode="numeric"
                />
                <Input
                  placeholder="IFSC Code"
                  value={withdrawForm.ifscCode}
                  onChange={(e) =>
                    setWithdrawForm((p) => ({
                      ...p,
                      ifscCode: e.target.value.toUpperCase(),
                    }))
                  }
                  className="h-12"
                />
              </div>
            </div>

            <div className="text-center text-muted-foreground text-sm">
              — OR —
            </div>

            <div className="space-y-2">
              <Label>UPI ID</Label>
              <Input
                placeholder="yourname@upi"
                value={withdrawForm.upiId}
                onChange={(e) =>
                  setWithdrawForm((p) => ({ ...p, upiId: e.target.value }))
                }
                className="h-12"
              />
            </div>

            <Button
              data-ocid="wallet.withdrawal_form.submit_button"
              size="lg"
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
              className="w-full h-14 gradient-primary border-0 text-white font-bold rounded-2xl"
            >
              {withdrawMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
