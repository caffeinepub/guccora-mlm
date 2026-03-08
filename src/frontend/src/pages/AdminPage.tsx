import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import {
  bigintToNum,
  formatDate,
  formatDateTime,
  formatINR,
} from "@/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownToLine,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  GitFork,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  WalletCards,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  PaymentRecord,
  Product,
  User,
  WithdrawalRequest,
} from "../backend.d";
import { Variant_left_right } from "../backend.d";

// ─── Admin Login Screen ────────────────────────────────────────────────────────

const ADMIN_MOBILES = ["6305462887", "9999999999"];

function AdminLogin() {
  const { actor } = useActor();
  const { setCurrentUser } = useAppContext();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!actor) return;
    if (!mobile.trim()) {
      toast.error("Enter mobile number");
      return;
    }
    setLoading(true);
    try {
      const mobileNum = mobile.trim();

      const user = await actor.loginUserByMobile(mobileNum);

      // Admin check: hardcoded numbers, role flag, or backend check
      let isAdmin = ADMIN_MOBILES.includes(mobileNum) || user.role === "admin";
      if (!isAdmin) {
        try {
          isAdmin = await actor.isCallerAdmin();
        } catch {
          // fallback already handled above
        }
      }

      if (!isAdmin) {
        toast.error("Not an admin account");
        setLoading(false);
        return;
      }
      setCurrentUser(user);
      toast.success("Admin login successful!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-dvh flex flex-col">
      {/* Header */}
      <div className="gradient-primary px-6 pt-16 pb-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-2xl font-black text-white mb-1"
        >
          Admin Login
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/60 text-sm"
        >
          Guccora Network Management
        </motion.p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 px-5 pt-8 pb-10 space-y-4"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">
            Mobile Number
          </Label>
          <Input
            data-ocid="admin.login.input"
            type="tel"
            placeholder="Enter admin mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="h-12 rounded-xl text-base"
          />
        </div>

        <Button
          data-ocid="admin.login.submit_button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-12 gradient-primary border-0 text-white font-bold rounded-xl text-base mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Login as Admin
            </>
          )}
        </Button>

        {/* Admin hint */}
        <div className="mt-4 p-4 rounded-xl bg-muted border border-border space-y-2">
          <p className="text-xs font-semibold text-foreground text-center mb-1">
            Admin Accounts
          </p>
          <div className="flex items-center justify-between gap-2 bg-background rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <code className="font-mono text-xs text-foreground">
                6305462887
              </code>
            </div>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
              Main Admin
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-background rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <code className="font-mono text-xs text-muted-foreground">
                9999999999
              </code>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full shrink-0 border border-border">
              Super Admin
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── User Search Selector (for Binary Tree) ────────────────────────────────────

interface UserSelectorProps {
  label: string;
  users: User[];
  selected: User | null;
  onSelect: (user: User) => void;
  placeholder?: string;
  "data-ocid"?: string;
}

function UserSelector({
  label,
  users,
  selected,
  onSelect,
  placeholder = "Search by name or mobile...",
  "data-ocid": dataOcid,
}: UserSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.mobile.includes(query),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="relative">
        <Input
          data-ocid={dataOcid}
          placeholder={selected ? selected.name : placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="h-11 pr-8"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        {selected && !query && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
            <span className="text-sm text-foreground font-medium truncate pr-8">
              {selected.name}{" "}
              <span className="text-muted-foreground font-normal">
                ({selected.mobile})
              </span>
            </span>
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full bg-popover border border-border rounded-xl shadow-card-lg mt-1 max-h-48 overflow-y-auto"
          >
            {filtered.slice(0, 8).map((u) => (
              <button
                key={String(u.userId)}
                type="button"
                className="w-full px-3 py-2.5 text-left hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(u);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  {u.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.mobile} • {u.referralCode}
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tx Type Badge ─────────────────────────────────────────────────────────────

function TxTypeBadge({ txType }: { txType: string }) {
  const config: Record<string, { label: string; className: string }> = {
    direct_income: {
      label: "Direct",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    binary_income: {
      label: "Binary",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    level_income: {
      label: "Level",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    withdrawal: {
      label: "W/D",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    admin_credit: {
      label: "Credit",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    joining: {
      label: "Joining",
      className: "badge-joining",
    },
  };

  const c = config[txType] ?? {
    label: txType,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] py-0 font-semibold border ${c.className}`}
    >
      {c.label}
    </Badge>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge
      variant="outline"
      className={`text-[10px] capitalize border font-semibold ${config[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
    </Badge>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const { logout } = useAppContext();
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────────────

  const [userSearch, setUserSearch] = useState("");
  const [withdrawalFilter, setWithdrawalFilter] = useState<"pending" | "all">(
    "pending",
  );
  const [txFilter, setTxFilter] = useState<
    "all" | "income" | "withdrawal" | "admin_credit"
  >("all");

  // Add user modal
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    mobile: "",
    referralCode: "",
    sponsorCode: "",
  });

  // Credit income dialog
  const [creditDialog, setCreditDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");

  // Reject withdrawal dialog
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    reqId: bigint | null;
  }>({ open: false, reqId: null });
  const [rejectNote, setRejectNote] = useState("");

  // Product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  // Edit product dialog
  const [editProductDialog, setEditProductDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Delete product confirm dialog
  const [deleteProductDialog, setDeleteProductDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  // Binary tree
  const [parentUser, setParentUser] = useState<User | null>(null);
  const [childUser, setChildUser] = useState<User | null>(null);
  const [binaryPosition, setBinaryPosition] = useState<"left" | "right">(
    "left",
  );

  // Admin Access tab
  const [accessSearch, setAccessSearch] = useState("");

  // Payments tab
  const [paymentFilter, setPaymentFilter] = useState<"pending" | "all">(
    "pending",
  );

  // Reject payment dialog
  const [rejectPaymentDialog, setRejectPaymentDialog] = useState<{
    open: boolean;
    paymentId: bigint | null;
  }>({ open: false, paymentId: null });
  const [rejectPaymentNote, setRejectPaymentNote] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.adminGetDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllUsers(BigInt(200), BigInt(0));
    },
    enabled: !!actor && !isFetching,
  });

  const { data: pendingWithdrawals, isLoading: pendingWithdrawalsLoading } =
    useQuery({
      queryKey: ["admin-withdrawals-pending"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.adminGetPendingWithdrawals();
      },
      enabled: !!actor && !isFetching && withdrawalFilter === "pending",
    });

  const { data: allWithdrawals, isLoading: allWithdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals-all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllWithdrawals(BigInt(200), BigInt(0));
    },
    enabled: !!actor && !isFetching && withdrawalFilter === "all",
  });

  const { data: allTransactions, isLoading: txLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetAllTransactions(BigInt(200), BigInt(0));
    },
    enabled: !!actor && !isFetching,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: pendingPayments, isLoading: pendingPaymentsLoading } = useQuery(
    {
      queryKey: ["admin-payments-pending"],
      queryFn: async () => {
        if (!actor) return [];
        return actor.adminGetPendingPayments();
      },
      enabled: !!actor && !isFetching && paymentFilter === "pending",
    },
  );

  const { data: allPayments, isLoading: allPaymentsLoading } = useQuery({
    queryKey: ["admin-payments-all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetPaymentHistory(BigInt(200), BigInt(0));
    },
    enabled: !!actor && !isFetching && paymentFilter === "all",
  });

  // Dedicated query for purchases tab — always fetches all payments
  const { data: allPurchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminGetPaymentHistory(BigInt(500), BigInt(0));
    },
    enabled: !!actor && !isFetching,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addUserMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!newUser.name.trim() || !newUser.mobile.trim()) {
        throw new Error("Name and mobile are required");
      }
      return actor.adminAddUser(
        newUser.name.trim(),
        newUser.mobile.trim(),
        newUser.referralCode.trim(),
        newUser.sponsorCode.trim(),
      );
    },
    onSuccess: () => {
      toast.success("User created!");
      setAddUserOpen(false);
      setNewUser({ name: "", mobile: "", referralCode: "", sponsorCode: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to add user");
    },
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ reqId, note }: { reqId: bigint; note: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminApproveWithdrawal(reqId, note);
    },
    onSuccess: () => {
      toast.success("Withdrawal approved!");
      queryClient.invalidateQueries({
        queryKey: ["admin-withdrawals-pending"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Approval failed");
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async ({ reqId, note }: { reqId: bigint; note: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminRejectWithdrawal(reqId, note);
    },
    onSuccess: () => {
      toast.success("Withdrawal rejected");
      setRejectDialog({ open: false, reqId: null });
      setRejectNote("");
      queryClient.invalidateQueries({
        queryKey: ["admin-withdrawals-pending"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals-all"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    },
  });

  const creditIncomeMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !creditDialog.user) throw new Error("Not connected");
      const amount = Number.parseFloat(creditAmount);
      if (Number.isNaN(amount) || amount <= 0)
        throw new Error("Invalid amount");
      await actor.adminCreditIncome(
        creditDialog.user.userId,
        amount,
        creditNote,
      );
    },
    onSuccess: () => {
      toast.success("Income credited successfully!");
      setCreditDialog({ open: false, user: null });
      setCreditAmount("");
      setCreditNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Credit failed");
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const price = Number.parseFloat(newProduct.price);
      if (!newProduct.name || !newProduct.description || Number.isNaN(price)) {
        throw new Error("Fill all fields with valid values");
      }
      await actor.adminCreateProduct(
        newProduct.name,
        newProduct.description,
        price,
      );
    },
    onSuccess: () => {
      toast.success("Product created!");
      setNewProduct({ name: "", description: "", price: "" });
      setShowAddProduct(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create product",
      );
    },
  });

  const toggleProductMutation = useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminToggleProduct(productId);
    },
    onSuccess: () => {
      toast.success("Product status updated!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Toggle failed");
    },
  });

  const editProductMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !editProductDialog.product)
        throw new Error("Not connected");
      const price = Number.parseFloat(editPrice);
      if (!editName.trim() || !editDescription.trim() || Number.isNaN(price)) {
        throw new Error("Fill all fields with valid values");
      }
      // Create new product with updated details
      await actor.adminCreateProduct(
        editName.trim(),
        editDescription.trim(),
        price,
      );
      // Deactivate old product (soft replace)
      await actor.adminToggleProduct(editProductDialog.product.productId);
    },
    onSuccess: () => {
      toast.success("Product updated!");
      setEditProductDialog({ open: false, product: null });
      setEditName("");
      setEditDescription("");
      setEditPrice("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Update failed");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminToggleProduct(productId);
    },
    onSuccess: () => {
      toast.success("Product removed!");
      setDeleteProductDialog({ open: false, product: null });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    },
  });

  const seedProductsMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.adminCreateProduct(
        "Guccora Starter Plan",
        "Starter product pack for MLM activation.",
        599,
      );
      await actor.adminCreateProduct(
        "Guccora Growth Plan",
        "Medium product pack with higher earning potential.",
        999,
      );
      await actor.adminCreateProduct(
        "Guccora Premium Plan",
        "Premium product pack with maximum earning benefits.",
        1999,
      );
    },
    onSuccess: () => {
      toast.success("Default products created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to seed products",
      );
    },
  });

  const setBinaryPositionMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !parentUser || !childUser) {
        throw new Error("Select both parent and child user");
      }
      if (parentUser.userId === childUser.userId) {
        throw new Error("Parent and child cannot be the same user");
      }
      const pos =
        binaryPosition === "left"
          ? Variant_left_right.left
          : Variant_left_right.right;
      await actor.adminSetBinaryPosition(
        parentUser.userId,
        childUser.userId,
        pos,
      );
    },
    onSuccess: () => {
      toast.success("Binary position updated!");
      setParentUser(null);
      setChildUser(null);
      setBinaryPosition("left");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: unknown) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to set position",
      );
    },
  });

  // NOTE: assignCallerUserRole is not used — admin roles are managed at the
  // system level. Mobile 6305462887 is the main admin (auto-seeded in backend).

  const confirmPaymentMutation = useMutation({
    mutationFn: async (paymentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminConfirmPayment(paymentId);
    },
    onSuccess: () => {
      toast.success("Payment confirmed! User account activated.");
      queryClient.invalidateQueries({ queryKey: ["admin-payments-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payments-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Confirmation failed");
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: async ({
      paymentId,
      note,
    }: {
      paymentId: bigint;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      await actor.adminRejectPayment(paymentId, note);
    },
    onSuccess: () => {
      toast.success("Payment rejected");
      setRejectPaymentDialog({ open: false, paymentId: null });
      setRejectPaymentNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-payments-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-payments-all"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Rejection failed");
    },
  });

  // ── Derived Data ───────────────────────────────────────────────────────────

  const filteredUsers = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobile.includes(userSearch) ||
      u.referralCode.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const withdrawals =
    withdrawalFilter === "pending"
      ? (pendingWithdrawals ?? [])
      : (allWithdrawals ?? []);
  const withdrawalsLoading =
    withdrawalFilter === "pending"
      ? pendingWithdrawalsLoading
      : allWithdrawalsLoading;

  const filteredTxs = (allTransactions ?? []).filter((tx) => {
    if (txFilter === "all") return true;
    if (txFilter === "income")
      return ["direct_income", "binary_income", "level_income"].includes(
        tx.txType,
      );
    if (txFilter === "withdrawal") return tx.txType === "withdrawal";
    if (txFilter === "admin_credit") return tx.txType === "admin_credit";
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  // Auto-fill referral code
  const handleNewUserMobileChange = (mobile: string) => {
    setNewUser((prev) => ({
      ...prev,
      mobile,
      referralCode:
        prev.referralCode === `GUC${prev.mobile.slice(-6)}`
          ? `GUC${mobile.slice(-6)}`
          : prev.referralCode,
    }));
  };

  // Build a userId → User lookup map for withdrawal cross-reference
  const userMap = new Map<string, User>(
    (users ?? []).map((u) => [String(u.userId), u]),
  );

  // Sorted products: active first
  const sortedProducts = [...(products ?? [])].sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  // Pending withdrawal count for badge
  const pendingWdCount = bigintToNum(
    stats?.pendingWithdrawalsCount ?? BigInt(0),
  );

  // Pending payment count for badge
  const pendingPayCount = bigintToNum(stats?.pendingPaymentsCount ?? BigInt(0));

  // Total payments count
  const totalPayCount = bigintToNum(stats?.totalPayments ?? BigInt(0));

  // Displayed payments list
  const payments: PaymentRecord[] =
    paymentFilter === "pending" ? (pendingPayments ?? []) : (allPayments ?? []);
  const paymentsLoading =
    paymentFilter === "pending" ? pendingPaymentsLoading : allPaymentsLoading;

  // Product lookup map
  const productMap = new Map<string, Product>(
    (products ?? []).map((p) => [String(p.productId), p]),
  );

  // Confirmed purchases (from dedicated purchases query)
  const confirmedPurchases = (allPurchasesData ?? []).filter(
    (p) => p.status === "confirmed",
  );

  // Purchase summary per product
  const purchaseSummaryMap = new Map<
    string,
    { count: number; totalRevenue: number }
  >();
  for (const purchase of confirmedPurchases) {
    const pid = String(purchase.productId);
    const existing = purchaseSummaryMap.get(pid) ?? {
      count: 0,
      totalRevenue: 0,
    };
    purchaseSummaryMap.set(pid, {
      count: existing.count + 1,
      totalRevenue: existing.totalRevenue + purchase.amount,
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell bg-background min-h-dvh">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Admin Panel
            </h1>
            <p className="text-white/60 text-xs mt-0.5">
              Guccora Network Management
            </p>
          </div>
          <Button
            data-ocid="admin.logout.button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
        {/* Quick stat strip in header */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 shrink-0">
            <Users className="w-3 h-3 text-white/70" />
            <span className="text-xs font-semibold text-white">
              {statsLoading ? "…" : bigintToNum(stats?.totalUsers ?? BigInt(0))}{" "}
              users
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 shrink-0">
            <ArrowDownToLine className="w-3 h-3 text-white/70" />
            <span className="text-xs font-semibold text-white">
              {statsLoading ? "…" : pendingWdCount} pending W/D
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 shrink-0">
            <Package className="w-3 h-3 text-white/70" />
            <span className="text-xs font-semibold text-white">
              {products?.length ?? "…"} products
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 shrink-0">
            <CreditCard className="w-3 h-3 text-white/70" />
            <span className="text-xs font-semibold text-white">
              {statsLoading ? "…" : pendingPayCount} pending pays
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        {/* Scrollable tabs on mobile */}
        <div className="border-b border-border bg-card sticky top-0 z-10">
          <div className="overflow-x-auto scrollbar-none">
            <TabsList className="inline-flex h-11 w-max min-w-full bg-transparent px-2 gap-0.5 rounded-none">
              <TabsTrigger
                value="stats"
                data-ocid="admin.stats.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                data-ocid="admin.users.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="withdrawals"
                data-ocid="admin.withdrawals.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 shrink-0" />
                <span>Withdrawals</span>
                {pendingWdCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 -ml-0.5">
                    {pendingWdCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                data-ocid="admin.transactions.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>Txns</span>
              </TabsTrigger>
              <TabsTrigger
                value="binary"
                data-ocid="admin.binary.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GitFork className="w-3.5 h-3.5 shrink-0" />
                <span>Tree</span>
              </TabsTrigger>
              <TabsTrigger
                value="products"
                data-ocid="admin.products.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>Products</span>
              </TabsTrigger>
              <TabsTrigger
                value="purchases"
                data-ocid="admin.purchases.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Purchases</span>
              </TabsTrigger>
              <TabsTrigger
                value="access"
                data-ocid="admin.access.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <UserCog className="w-3.5 h-3.5 shrink-0" />
                <span>Access</span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                data-ocid="admin.payments.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>Payments</span>
                {pendingPayCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1 -ml-0.5">
                    {pendingPayCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ── Tab 1: Stats ──────────────────────────────────────────────────── */}
        <TabsContent value="stats" className="px-4 pb-8 pt-4">
          {/* Quick overview strip */}
          {statsLoading ? (
            <Skeleton
              className="h-16 rounded-2xl mb-4"
              data-ocid="admin.stats.loading_state"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 bg-card border border-border rounded-2xl px-4 py-3 mb-4 overflow-x-auto scrollbar-none"
            >
              <div className="flex flex-col items-center shrink-0 min-w-[60px]">
                <p className="font-display text-xl font-black text-primary">
                  {bigintToNum(stats?.totalUsers ?? BigInt(0))}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                  Total Users
                </p>
              </div>
              <div className="w-px bg-border shrink-0" />
              <div className="flex flex-col items-center shrink-0 min-w-[60px]">
                <p className="font-display text-xl font-black text-destructive">
                  {pendingWdCount}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                  Pending W/D
                </p>
              </div>
              <div className="w-px bg-border shrink-0" />
              <div className="flex flex-col items-center shrink-0 min-w-[72px]">
                <p className="font-display text-base font-black text-foreground leading-tight">
                  {formatINR(stats?.totalIncomeDistributed ?? 0)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 text-center">
                  Distributed
                </p>
              </div>
            </motion.div>
          )}

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 rounded-2xl"
                  data-ocid="admin.stats.loading_state"
                />
              ))
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gradient-primary rounded-2xl p-5 text-white"
                >
                  <Users className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {bigintToNum(stats?.totalUsers ?? BigInt(0))}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Total Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="gradient-direct rounded-2xl p-5 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {bigintToNum(stats?.activeUsers ?? BigInt(0))}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Active Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="gradient-binary rounded-2xl p-5 text-white"
                >
                  <Wallet className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-2xl font-black leading-tight">
                    {formatINR(stats?.totalIncomeDistributed ?? 0)}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Income Distributed
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="gradient-level rounded-2xl p-5 text-white"
                >
                  <ArrowDownToLine className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-2xl font-black leading-tight">
                    {formatINR(stats?.pendingWithdrawalsAmount ?? 0)}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Pending W/D ({pendingWdCount})
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white"
                >
                  <Package className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {products?.length ?? 0}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Total Products</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-5 text-white"
                >
                  <Wallet className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {allTransactions?.length ?? 0}
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    Total Transactions
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white"
                >
                  <CreditCard className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {totalPayCount}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Total Payments</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white"
                >
                  <Clock className="w-5 h-5 text-white/70 mb-3" />
                  <p className="font-display text-3xl font-black">
                    {pendingPayCount}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Pending Payments</p>
                </motion.div>
              </>
            )}
          </div>

          {/* System status note */}
          {!statsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3"
            >
              <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  System online.
                </span>{" "}
                {bigintToNum(stats?.activeUsers ?? BigInt(0))} of{" "}
                {bigintToNum(stats?.totalUsers ?? BigInt(0))} users are active.{" "}
                {pendingWdCount > 0
                  ? `${pendingWdCount} withdrawal${pendingWdCount !== 1 ? "s" : ""} awaiting review.`
                  : "No pending withdrawals."}
              </p>
            </motion.div>
          )}
        </TabsContent>

        {/* ── Tab 2: Users ──────────────────────────────────────────────────── */}
        <TabsContent value="users" className="px-4 pb-8 pt-4">
          <div className="flex gap-2 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="admin.users.search_input"
                placeholder="Search by name, mobile, or code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            {/* Add User */}
            <Button
              data-ocid="admin.users.open_modal_button"
              onClick={() => setAddUserOpen(true)}
              className="gradient-primary border-0 text-white rounded-xl h-11 px-3 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              data-ocid="admin.users.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No users found</p>
              <p className="text-sm mt-1">
                {userSearch ? "Try a different search" : "Add your first user"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={String(user.userId)}
                  data-ocid={`admin.users.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  {/* Row 1: Name + status badges */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {user.name}
                      </p>
                      {user.isActive ? (
                        <Badge className="badge-direct text-[10px] py-0 shrink-0">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 text-muted-foreground shrink-0"
                        >
                          Inactive
                        </Badge>
                      )}
                      {user.role === "admin" && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] py-0 shrink-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <Button
                      data-ocid={`admin.users.edit_button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary text-xs rounded-lg shrink-0 gap-1"
                      onClick={() => {
                        setCreditDialog({ open: true, user });
                        setCreditAmount("");
                        setCreditNote("");
                      }}
                    >
                      <WalletCards className="w-3 h-3" />
                      Add Credit
                    </Button>
                  </div>

                  {/* Row 2: Mobile + Referral code */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1.5">
                    <span>📱 +91 {user.mobile}</span>
                    <span>
                      Code:{" "}
                      <span className="font-semibold text-foreground font-mono">
                        {user.referralCode}
                      </span>
                    </span>
                  </div>

                  {/* Row 3: Balance + Join date */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1.5">
                    <span>
                      Bal:{" "}
                      <span className="font-bold text-primary">
                        {formatINR(user.walletBalance)}
                      </span>
                    </span>
                    <span>Joined: {formatDate(user.joinDate)}</span>
                  </div>

                  {/* Row 4: Binary leg chips if they exist */}
                  {(user.leftChildId || user.rightChildId) && (
                    <div className="flex items-center gap-2 mt-1">
                      {user.leftChildId && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">
                          L:{" "}
                          {userMap.get(String(user.leftChildId))?.name ??
                            `#${String(user.leftChildId).slice(-4)}`}
                        </span>
                      )}
                      {user.rightChildId && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">
                          R:{" "}
                          {userMap.get(String(user.rightChildId))?.name ??
                            `#${String(user.rightChildId).slice(-4)}`}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 3: Withdrawals ────────────────────────────────────────────── */}
        <TabsContent value="withdrawals" className="px-4 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-0.5">
                Withdrawal Approvals
              </h2>
              <p className="text-xs text-muted-foreground">
                Review and process withdrawal requests
              </p>
            </div>
            {pendingWdCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full px-3 py-1">
                <Clock className="w-3 h-3" />
                {pendingWdCount} pending
              </span>
            )}
          </div>
          {/* Filter chips */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              data-ocid="admin.withdrawals.pending.tab"
              onClick={() => setWithdrawalFilter("pending")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                withdrawalFilter === "pending"
                  ? "gradient-primary border-0 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
              {pendingWdCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold px-1 ${
                    withdrawalFilter === "pending"
                      ? "bg-white/25 text-white"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {pendingWdCount}
                </span>
              )}
            </button>
            <button
              type="button"
              data-ocid="admin.withdrawals.all.tab"
              onClick={() => setWithdrawalFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                withdrawalFilter === "all"
                  ? "gradient-primary border-0 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
          </div>

          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-36 rounded-xl" />
              ))}
            </div>
          ) : withdrawals.length === 0 ? (
            <div
              data-ocid="admin.withdrawals.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <ArrowDownToLine className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">
                {withdrawalFilter === "pending"
                  ? "No pending withdrawals"
                  : "No withdrawals found"}
              </p>
              <p className="text-sm mt-1">
                {withdrawalFilter === "pending"
                  ? "All requests have been processed"
                  : "Withdrawal history will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((wr: WithdrawalRequest, i) => {
                const requestingUser = userMap.get(String(wr.userId));
                return (
                  <motion.div
                    key={String(wr.reqId)}
                    data-ocid={`admin.withdrawals.item.${i + 1}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    {/* User identity row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-foreground text-sm truncate">
                            {requestingUser?.name ??
                              `User …${String(wr.userId).slice(-6)}`}
                          </p>
                          <StatusBadge status={wr.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {requestingUser
                            ? `+91 ${requestingUser.mobile}`
                            : `ID: …${String(wr.userId).slice(-6)}`}
                        </p>
                      </div>
                      <p className="font-display text-lg font-black text-foreground shrink-0">
                        {formatINR(wr.amount)}
                      </p>
                    </div>

                    {/* Bank / UPI details */}
                    {wr.bankName && (
                      <p className="text-xs text-muted-foreground mb-0.5">
                        🏦 {wr.bankName} • ****{wr.accountNumber.slice(-4)} •{" "}
                        {wr.ifscCode}
                      </p>
                    )}
                    {wr.upiId && (
                      <p className="text-xs text-muted-foreground mb-0.5">
                        📲 UPI: {wr.upiId}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      🕐 {formatDateTime(wr.requestDate)}
                    </p>

                    {wr.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`admin.withdrawals.confirm_button.${i + 1}`}
                          className="flex-1 h-10 gradient-direct border-0 text-white font-semibold rounded-lg"
                          onClick={() =>
                            approveWithdrawalMutation.mutate({
                              reqId: wr.reqId,
                              note: "Approved by admin",
                            })
                          }
                          disabled={approveWithdrawalMutation.isPending}
                        >
                          {approveWithdrawalMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          data-ocid={`admin.withdrawals.delete_button.${i + 1}`}
                          variant="destructive"
                          className="flex-1 h-10 font-semibold rounded-lg"
                          onClick={() => {
                            setRejectDialog({ open: true, reqId: wr.reqId });
                            setRejectNote("");
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 4: Transactions ───────────────────────────────────────────── */}
        <TabsContent value="transactions" className="px-4 pb-8 pt-4">
          {/* Filter chips */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { key: "all", label: "All" },
                { key: "income", label: "Income" },
                { key: "withdrawal", label: "W/D" },
                { key: "admin_credit", label: "Credits" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                data-ocid={`admin.transactions.${key}.tab`}
                onClick={() => setTxFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-colors shrink-0 ${
                  txFilter === key
                    ? "gradient-primary border-0 text-white"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {txLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : filteredTxs.length === 0 ? (
            <div
              data-ocid="admin.transactions.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTxs.map((tx, i) => {
                const isDebit = tx.txType === "withdrawal";
                const txUser = userMap.get(String(tx.userId));
                return (
                  <motion.div
                    key={String(tx.txId)}
                    data-ocid={`admin.transactions.item.${i + 1}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TxTypeBadge txType={tx.txType} />
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.note ||
                            (txUser
                              ? txUser.name
                              : `User …${String(tx.userId).slice(-4)}`)}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDateTime(tx.timestamp)} •{" "}
                        {txUser
                          ? txUser.mobile
                          : `…${String(tx.userId).slice(-4)}`}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-bold shrink-0 ${
                        isDebit ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {isDebit ? "-" : "+"}
                      {formatINR(tx.amount)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 5: Binary Tree ────────────────────────────────────────────── */}
        <TabsContent value="binary" className="px-4 pb-8 pt-4">
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                Manage Binary Positions
              </h2>
              <p className="text-xs text-muted-foreground">
                Assign a child user to the left or right leg of a parent user.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-4 relative">
              {/* Parent */}
              <UserSelector
                label="Parent User"
                users={users ?? []}
                selected={parentUser}
                onSelect={setParentUser}
                placeholder="Search parent by name or mobile..."
                data-ocid="admin.binary.parent.input"
              />

              {/* Child */}
              <UserSelector
                label="Child User"
                users={users ?? []}
                selected={childUser}
                onSelect={setChildUser}
                placeholder="Search child by name or mobile..."
                data-ocid="admin.binary.child.input"
              />

              {/* Position toggle */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Position</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="admin.binary.left.toggle"
                    onClick={() => setBinaryPosition("left")}
                    className={`flex-1 h-10 rounded-xl font-semibold text-sm transition-all border ${
                      binaryPosition === "left"
                        ? "gradient-primary border-0 text-white shadow-glow-violet"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ← Left
                  </button>
                  <button
                    type="button"
                    data-ocid="admin.binary.right.toggle"
                    onClick={() => setBinaryPosition("right")}
                    className={`flex-1 h-10 rounded-xl font-semibold text-sm transition-all border ${
                      binaryPosition === "right"
                        ? "gradient-primary border-0 text-white shadow-glow-violet"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Right →
                  </button>
                </div>
              </div>

              <Button
                data-ocid="admin.binary.submit_button"
                onClick={() => setBinaryPositionMutation.mutate()}
                disabled={
                  setBinaryPositionMutation.isPending ||
                  !parentUser ||
                  !childUser
                }
                className="w-full h-11 gradient-primary border-0 text-white font-bold rounded-xl"
              >
                {setBinaryPositionMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <GitFork className="w-4 h-4 mr-2" />
                )}
                Set Position
              </Button>
            </div>

            {/* Parent info preview with named children */}
            <AnimatePresence>
              {parentUser && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-secondary/50 border border-border rounded-2xl p-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Tree Preview
                  </p>

                  {/* Parent node */}
                  <div className="flex flex-col items-center mb-2">
                    <div className="tree-node active w-36 text-center">
                      <p className="text-xs font-bold text-foreground truncate">
                        {parentUser.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {parentUser.mobile}
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center mb-1">
                    <div className="tree-connector" />
                  </div>

                  {/* Children row */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left child */}
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Left
                      </p>
                      {parentUser.leftChildId ? (
                        <div className="tree-node active w-full text-center">
                          <p className="text-xs font-bold text-foreground truncate">
                            {userMap.get(String(parentUser.leftChildId))
                              ?.name ??
                              `User #${String(parentUser.leftChildId).slice(-4)}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {userMap.get(String(parentUser.leftChildId))
                              ?.mobile ?? ""}
                          </p>
                        </div>
                      ) : (
                        <div className="tree-node empty w-full text-center">
                          <p className="text-[10px] text-muted-foreground">
                            Empty
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Right child */}
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Right
                      </p>
                      {parentUser.rightChildId ? (
                        <div className="tree-node active w-full text-center">
                          <p className="text-xs font-bold text-foreground truncate">
                            {userMap.get(String(parentUser.rightChildId))
                              ?.name ??
                              `User #${String(parentUser.rightChildId).slice(-4)}`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {userMap.get(String(parentUser.rightChildId))
                              ?.mobile ?? ""}
                          </p>
                        </div>
                      ) : (
                        <div className="tree-node empty w-full text-center">
                          <p className="text-[10px] text-muted-foreground">
                            Empty
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ── Tab 6: Products ───────────────────────────────────────────────── */}
        <TabsContent value="products" className="px-4 pb-8 pt-4">
          <div className="flex gap-2 mb-4">
            <Button
              data-ocid="admin.products.open_modal_button"
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="flex-1 h-12 gradient-primary border-0 text-white font-bold rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </div>

          {/* Setup Default Products button — shown when no active products exist */}
          {!productsLoading &&
            (!sortedProducts ||
              sortedProducts.length === 0 ||
              sortedProducts.every((p) => !p.isActive)) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Package className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      No products found
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Quickly seed the 3 default Guccora plans (₹599, ₹999,
                      ₹1999) with one click.
                    </p>
                  </div>
                </div>
                <Button
                  data-ocid="admin.products.seed_button"
                  onClick={() => seedProductsMutation.mutate()}
                  disabled={seedProductsMutation.isPending}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 border-0 text-white font-bold rounded-xl"
                >
                  {seedProductsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating products...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Setup Default Products
                    </>
                  )}
                </Button>
              </motion.div>
            )}

          {/* Inline add product form */}
          <AnimatePresence>
            {showAddProduct && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">New Product</h3>
                  <Input
                    data-ocid="admin.products.name.input"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, name: e.target.value }))
                    }
                    className="h-11"
                  />
                  <Textarea
                    data-ocid="admin.products.description.textarea"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="resize-none"
                  />
                  <Input
                    data-ocid="admin.products.price.input"
                    placeholder="Price (₹)"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, price: e.target.value }))
                    }
                    className="h-11"
                  />
                  <div className="flex gap-2">
                    <Button
                      data-ocid="admin.products.cancel_button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddProduct(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      data-ocid="admin.products.submit_button"
                      size="sm"
                      onClick={() => addProductMutation.mutate()}
                      disabled={addProductMutation.isPending}
                      className="flex-1 gradient-primary border-0 text-white"
                    >
                      {addProductMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !sortedProducts || sortedProducts.length === 0 ? (
            <div
              data-ocid="admin.products.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No products yet</p>
              <p className="text-sm mt-1">Add your first product above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProducts.map((product, i) => (
                <motion.div
                  key={String(product.productId)}
                  data-ocid={`admin.products.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className={`bg-card border rounded-xl p-4 ${
                    product.isActive
                      ? "border-primary/30"
                      : "border-border opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground truncate">
                          {product.name}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            product.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {product.isActive ? "Active" : "Off"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-sm font-bold text-primary mt-2">
                        {formatINR(product.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <Switch
                        data-ocid={`admin.products.switch.${i + 1}`}
                        checked={product.isActive}
                        onCheckedChange={() =>
                          toggleProductMutation.mutate(product.productId)
                        }
                        disabled={toggleProductMutation.isPending}
                      />
                      <div className="flex gap-1">
                        <Button
                          data-ocid={`admin.products.edit_button.${i + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            setEditProductDialog({ open: true, product });
                            setEditName(product.name);
                            setEditDescription(product.description);
                            setEditPrice(String(product.price));
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          data-ocid={`admin.products.delete_button.${i + 1}`}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            setDeleteProductDialog({ open: true, product })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Purchase Summary */}
          {!purchasesLoading && confirmedPurchases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">
                  Purchase Summary
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({confirmedPurchases.length} confirmed)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sortedProducts
                  .filter((p) => purchaseSummaryMap.has(String(p.productId)))
                  .map((product, i) => {
                    const summary = purchaseSummaryMap.get(
                      String(product.productId),
                    )!;
                    return (
                      <motion.div
                        key={String(product.productId)}
                        data-ocid={`admin.products.purchase.card.${i + 1}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(i * 0.05, 0.2) }}
                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-3"
                      >
                        <p className="text-xs font-semibold text-emerald-900 leading-tight line-clamp-2 mb-2">
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-emerald-600 text-white text-[10px] font-bold px-1.5">
                            {summary.count}
                          </span>
                          <p className="text-xs font-bold text-emerald-700">
                            {formatINR(summary.totalRevenue)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ── Tab 7a: Purchases ─────────────────────────────────────────────── */}
        <TabsContent value="purchases" className="px-4 pb-8 pt-4">
          {/* Header */}
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground mb-0.5">
              Product Purchase History
            </h2>
            <p className="text-xs text-muted-foreground">
              All confirmed product purchases
            </p>
          </div>

          {purchasesLoading ? (
            <div
              data-ocid="admin.purchases.loading_state"
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : confirmedPurchases.length === 0 ? (
            <div
              data-ocid="admin.purchases.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No confirmed purchases yet</p>
              <p className="text-sm mt-1">
                Confirmed purchases will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {confirmedPurchases.map((purchase: PaymentRecord, i) => {
                const purchaseUser = userMap.get(String(purchase.userId));
                const purchaseProduct = productMap.get(
                  String(purchase.productId),
                );
                return (
                  <motion.div
                    key={String(purchase.paymentId)}
                    data-ocid={`admin.purchases.item.${i + 1}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="bg-card border border-emerald-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-foreground text-sm truncate">
                            {purchaseUser?.name ??
                              `User …${String(purchase.userId).slice(-6)}`}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[10px] border font-semibold bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            Confirmed
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {purchaseUser
                            ? `+91 ${purchaseUser.mobile}`
                            : `ID: …${String(purchase.userId).slice(-6)}`}
                        </p>
                      </div>
                      <p className="font-display text-lg font-black text-emerald-700 shrink-0">
                        {formatINR(purchase.amount)}
                      </p>
                    </div>

                    {purchaseProduct && (
                      <p className="text-xs text-muted-foreground mb-0.5">
                        📦 {purchaseProduct.name}
                      </p>
                    )}
                    {purchase.upiTransactionRef && (
                      <p className="text-xs text-muted-foreground mb-0.5">
                        🔑 UTR:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {purchase.upiTransactionRef}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      🕐 {formatDateTime(purchase.timestamp)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 8: Payments ──────────────────────────────────────────────── */}
        <TabsContent value="payments" className="px-4 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-0.5">
                Payment Approvals
              </h2>
              <p className="text-xs text-muted-foreground">
                Review and approve user payments
              </p>
            </div>
            {pendingPayCount > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full px-3 py-1">
                <Clock className="w-3 h-3" />
                {pendingPayCount} pending
              </span>
            )}
          </div>
          {/* Filter chips */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              data-ocid="admin.payments.pending.tab"
              onClick={() => setPaymentFilter("pending")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                paymentFilter === "pending"
                  ? "gradient-primary border-0 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
              {pendingPayCount > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold px-1 ${
                    paymentFilter === "pending"
                      ? "bg-white/25 text-white"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {pendingPayCount}
                </span>
              )}
            </button>
            <button
              type="button"
              data-ocid="admin.payments.all.tab"
              onClick={() => setPaymentFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                paymentFilter === "all"
                  ? "gradient-primary border-0 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
          </div>

          {paymentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div
              data-ocid="admin.payments.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">
                {paymentFilter === "pending"
                  ? "No pending payments"
                  : "No payments found"}
              </p>
              <p className="text-sm mt-1">
                {paymentFilter === "pending"
                  ? "All payments have been processed"
                  : "Payment history will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment: PaymentRecord, i) => {
                const payUser = userMap.get(String(payment.userId));
                const payProduct = productMap.get(String(payment.productId));
                const statusConfig: Record<
                  string,
                  { className: string; label: string }
                > = {
                  pending: {
                    className: "bg-amber-50 text-amber-700 border-amber-200",
                    label: "Pending",
                  },
                  confirmed: {
                    className:
                      "bg-emerald-50 text-emerald-700 border-emerald-200",
                    label: "Confirmed",
                  },
                  rejected: {
                    className: "bg-red-50 text-red-700 border-red-200",
                    label: "Rejected",
                  },
                };
                const sc = statusConfig[payment.status] ?? {
                  className: "bg-muted text-muted-foreground border-border",
                  label: payment.status,
                };

                return (
                  <motion.div
                    key={String(payment.paymentId)}
                    data-ocid={`admin.payments.item.${i + 1}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    {/* User + status row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-foreground text-sm truncate">
                            {payUser?.name ??
                              `User …${String(payment.userId).slice(-6)}`}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize border font-semibold ${sc.className}`}
                          >
                            {sc.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {payUser
                            ? `+91 ${payUser.mobile}`
                            : `ID: …${String(payment.userId).slice(-6)}`}
                        </p>
                      </div>
                      <p className="font-display text-lg font-black text-foreground shrink-0">
                        {formatINR(payment.amount)}
                      </p>
                    </div>

                    {/* Product + UTR + Timestamp */}
                    {payProduct && (
                      <p className="text-xs text-muted-foreground mb-0.5">
                        📦 {payProduct.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-0.5">
                      🔑 UTR:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {payment.upiTransactionRef || "—"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      🕐 {formatDateTime(payment.timestamp)}
                    </p>

                    {/* Admin note if rejected */}
                    {payment.status === "rejected" && payment.adminNote && (
                      <p className="text-xs text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        Note: {payment.adminNote}
                      </p>
                    )}

                    {/* Action buttons for pending */}
                    {payment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          data-ocid={`admin.payments.confirm_button.${i + 1}`}
                          className="flex-1 h-10 gradient-direct border-0 text-white font-semibold rounded-lg"
                          onClick={() =>
                            confirmPaymentMutation.mutate(payment.paymentId)
                          }
                          disabled={confirmPaymentMutation.isPending}
                        >
                          {confirmPaymentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Confirm
                            </>
                          )}
                        </Button>
                        <Button
                          data-ocid={`admin.payments.delete_button.${i + 1}`}
                          variant="destructive"
                          className="flex-1 h-10 font-semibold rounded-lg"
                          onClick={() => {
                            setRejectPaymentDialog({
                              open: true,
                              paymentId: payment.paymentId,
                            });
                            setRejectPaymentNote("");
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 7: Admin Access ───────────────────────────────────────────── */}
        <TabsContent value="access" className="px-4 pb-8 pt-4">
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-1">
                Admin Access
              </h2>
              <p className="text-xs text-muted-foreground">
                View users and their admin status. Admin roles are managed at
                the system level.
              </p>
            </div>

            {/* System info banner */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4"
            >
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  Admin roles are managed at the system level
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mobile{" "}
                  <code className="font-mono bg-background px-1 py-0.5 rounded text-primary font-bold">
                    6305462887
                  </code>{" "}
                  is the main admin and is auto-assigned in the backend. Admin
                  access cannot be modified from this panel.
                </p>
              </div>
            </motion.div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="admin.access.search_input"
                placeholder="Search by name or mobile number..."
                value={accessSearch}
                onChange={(e) => setAccessSearch(e.target.value)}
                className="pl-10 h-11"
                type="tel"
              />
            </div>

            {/* Results — read-only */}
            {(() => {
              const accessSearchTrimmed = accessSearch.trim();

              const allUsers = users ?? [];
              const accessResults = accessSearchTrimmed
                ? allUsers.filter(
                    (u) =>
                      u.mobile.includes(accessSearchTrimmed) ||
                      u.name
                        .toLowerCase()
                        .includes(accessSearchTrimmed.toLowerCase()),
                  )
                : allUsers.filter((u) => u.role === "admin");

              if (!accessSearchTrimmed && accessResults.length === 0) {
                return (
                  <div
                    data-ocid="admin.access.empty_state"
                    className="text-center py-12 text-muted-foreground"
                  >
                    <UserCog className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No admin users found</p>
                    <p className="text-sm mt-1">
                      Search above to find a specific user
                    </p>
                  </div>
                );
              }

              if (accessSearchTrimmed && accessResults.length === 0) {
                return (
                  <div
                    data-ocid="admin.access.empty_state"
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No users found</p>
                    <p className="text-sm mt-1">
                      Try a different mobile number or name
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {!accessSearchTrimmed && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Admin Users ({accessResults.length})
                    </p>
                  )}
                  {accessResults.slice(0, 10).map((user, i) => {
                    const isAdminUser = user.role === "admin";
                    const isMainAdmin = user.mobile === "6305462887";
                    return (
                      <motion.div
                        key={String(user.userId)}
                        data-ocid={`admin.access.item.${i + 1}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.2) }}
                        className={`bg-card border rounded-xl p-4 ${isAdminUser ? "border-primary/30" : "border-border"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-bold text-foreground truncate">
                                {user.name}
                              </p>
                              {isAdminUser ? (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] py-0 shrink-0">
                                  {isMainAdmin ? "Main Admin" : "Admin"}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0 text-muted-foreground shrink-0"
                                >
                                  User
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              📱 +91 {user.mobile}
                            </p>
                          </div>
                          {isAdminUser && (
                            <ShieldCheck
                              className={`w-5 h-5 shrink-0 ${isMainAdmin ? "text-primary" : "text-purple-500"}`}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Add User Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent
          data-ocid="admin.users.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input
                data-ocid="admin.users.name.input"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label>Mobile Number</Label>
              <Input
                data-ocid="admin.users.mobile.input"
                type="tel"
                placeholder="10-digit mobile number"
                value={newUser.mobile}
                onChange={(e) => handleNewUserMobileChange(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label>Referral Code</Label>
              <Input
                data-ocid="admin.users.referral.input"
                placeholder="e.g. GUC123456"
                value={newUser.referralCode}
                onChange={(e) =>
                  setNewUser((p) => ({ ...p, referralCode: e.target.value }))
                }
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label>Sponsor Code (optional)</Label>
              <Input
                data-ocid="admin.users.sponsor.input"
                placeholder="Sponsor's referral code"
                value={newUser.sponsorCode}
                onChange={(e) =>
                  setNewUser((p) => ({ ...p, sponsorCode: e.target.value }))
                }
                className="mt-1 h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.users.cancel_button"
              variant="outline"
              onClick={() => setAddUserOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.users.submit_button"
              onClick={() => addUserMutation.mutate()}
              disabled={addUserMutation.isPending}
              className="flex-1 gradient-primary border-0 text-white"
            >
              {addUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Credit Income Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={creditDialog.open}
        onOpenChange={(open) => setCreditDialog((p) => ({ ...p, open }))}
      >
        <DialogContent
          data-ocid="admin.credit.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Add Credit</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Crediting to:{" "}
            <span className="font-semibold text-foreground">
              {creditDialog.user?.name}
            </span>
          </p>
          <div className="space-y-3">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                data-ocid="admin.credit.amount.input"
                type="number"
                placeholder="Enter amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                data-ocid="admin.credit.note.input"
                placeholder="Reason for credit"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.credit.cancel_button"
              variant="outline"
              onClick={() => setCreditDialog({ open: false, user: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.credit.submit_button"
              onClick={() => creditIncomeMutation.mutate()}
              disabled={creditIncomeMutation.isPending}
              className="flex-1 gradient-primary border-0 text-white"
            >
              {creditIncomeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Credit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Withdrawal Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((p) => ({ ...p, open }))}
      >
        <DialogContent
          data-ocid="admin.reject.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Reject Withdrawal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Rejection Note</Label>
            <Input
              data-ocid="admin.reject.note.input"
              placeholder="Reason for rejection"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="h-11"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.reject.cancel_button"
              variant="outline"
              onClick={() => setRejectDialog({ open: false, reqId: null })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.reject.confirm_button"
              variant="destructive"
              onClick={() => {
                if (rejectDialog.reqId) {
                  rejectWithdrawalMutation.mutate({
                    reqId: rejectDialog.reqId,
                    note: rejectNote,
                  });
                }
              }}
              disabled={rejectWithdrawalMutation.isPending}
              className="flex-1"
            >
              {rejectWithdrawalMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Product Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={editProductDialog.open}
        onOpenChange={(open) => setEditProductDialog((p) => ({ ...p, open }))}
      >
        <DialogContent
          data-ocid="admin.products.edit.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product Name</Label>
              <Input
                data-ocid="admin.products.edit.name.input"
                placeholder="Product name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                data-ocid="admin.products.edit.description.textarea"
                placeholder="Product description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1 resize-none"
              />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input
                data-ocid="admin.products.edit.price.input"
                type="number"
                placeholder="Price"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.products.edit.cancel_button"
              variant="outline"
              onClick={() =>
                setEditProductDialog({ open: false, product: null })
              }
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.products.edit.submit_button"
              onClick={() => editProductMutation.mutate()}
              disabled={editProductMutation.isPending}
              className="flex-1 gradient-primary border-0 text-white"
            >
              {editProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Product AlertDialog ────────────────────────────────────────── */}
      <AlertDialog
        open={deleteProductDialog.open}
        onOpenChange={(open) => setDeleteProductDialog((p) => ({ ...p, open }))}
      >
        <AlertDialogContent
          data-ocid="admin.products.delete.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Product
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {deleteProductDialog.product?.name}
              </span>
              ? It will be deactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.products.delete.cancel_button"
              onClick={() =>
                setDeleteProductDialog({ open: false, product: null })
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.products.delete.confirm_button"
              onClick={() => {
                if (deleteProductDialog.product) {
                  deleteProductMutation.mutate(
                    deleteProductDialog.product.productId,
                  );
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject Payment Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={rejectPaymentDialog.open}
        onOpenChange={(open) => setRejectPaymentDialog((p) => ({ ...p, open }))}
      >
        <DialogContent
          data-ocid="admin.payments.reject.dialog"
          className="max-w-sm rounded-3xl mx-4"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Rejection Note (optional)</Label>
            <Input
              data-ocid="admin.payments.reject.note.input"
              placeholder="Reason for rejection"
              value={rejectPaymentNote}
              onChange={(e) => setRejectPaymentNote(e.target.value)}
              className="h-11"
              onKeyDown={(e) => {
                if (e.key === "Enter" && rejectPaymentDialog.paymentId) {
                  rejectPaymentMutation.mutate({
                    paymentId: rejectPaymentDialog.paymentId,
                    note: rejectPaymentNote,
                  });
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.payments.reject.cancel_button"
              variant="outline"
              onClick={() =>
                setRejectPaymentDialog({ open: false, paymentId: null })
              }
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.payments.reject.confirm_button"
              variant="destructive"
              onClick={() => {
                if (rejectPaymentDialog.paymentId) {
                  rejectPaymentMutation.mutate({
                    paymentId: rejectPaymentDialog.paymentId,
                    note: rejectPaymentNote,
                  });
                }
              }}
              disabled={rejectPaymentMutation.isPending}
              className="flex-1"
            >
              {rejectPaymentMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main AdminPage (Auth Gate) ────────────────────────────────────────────────

export default function AdminPage() {
  const { isAdmin } = useAppContext();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
