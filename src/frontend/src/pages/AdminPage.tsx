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
  ArrowDownToLine,
  CheckCircle2,
  ChevronDown,
  GitFork,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product, User, WithdrawalRequest } from "../backend.d";
import { Variant_left_right } from "../backend.d";

// ─── Admin Login Screen ────────────────────────────────────────────────────────

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
      const otp = await actor.generateOTP(mobile.trim());
      const user = await actor.loginUser(mobile.trim(), otp);
      const isAdmin = await actor.isCallerAdmin();
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

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl bg-muted border border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <span className="font-semibold text-foreground">Demo:</span> Mobile{" "}
            <code className="font-mono bg-background px-1 py-0.5 rounded text-foreground">
              9999999999
            </code>
          </p>
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell bg-background min-h-dvh">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-5">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        {/* Scrollable tabs on mobile */}
        <div className="border-b border-border bg-card">
          <div className="overflow-x-auto scrollbar-none">
            <TabsList className="inline-flex h-11 w-max min-w-full bg-transparent px-2 gap-0.5 rounded-none">
              <TabsTrigger
                value="stats"
                data-ocid="admin.stats.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Stats
              </TabsTrigger>
              <TabsTrigger
                value="users"
                data-ocid="admin.users.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-3.5 h-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="withdrawals"
                data-ocid="admin.withdrawals.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                W/D
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                data-ocid="admin.transactions.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Wallet className="w-3.5 h-3.5" />
                Txns
              </TabsTrigger>
              <TabsTrigger
                value="binary"
                data-ocid="admin.binary.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GitFork className="w-3.5 h-3.5" />
                Tree
              </TabsTrigger>
              <TabsTrigger
                value="products"
                data-ocid="admin.products.tab"
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Package className="w-3.5 h-3.5" />
                Products
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ── Tab 1: Stats ──────────────────────────────────────────────────── */}
        <TabsContent value="stats" className="px-4 pb-8 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-24 rounded-2xl"
                  data-ocid="admin.stats.loading_state"
                />
              ))
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gradient-primary rounded-2xl p-4 text-white"
                >
                  <Users className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-2xl font-black">
                    {bigintToNum(stats?.totalUsers ?? BigInt(0))}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">Total Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="gradient-direct rounded-2xl p-4 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-2xl font-black">
                    {bigintToNum(stats?.activeUsers ?? BigInt(0))}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">Active Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="gradient-binary rounded-2xl p-4 text-white"
                >
                  <Wallet className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-xl font-black">
                    {formatINR(stats?.totalIncomeDistributed ?? 0)}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    Income Distributed
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="gradient-level rounded-2xl p-4 text-white"
                >
                  <ArrowDownToLine className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-xl font-black">
                    {formatINR(stats?.pendingWithdrawalsAmount ?? 0)}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    Pending W/D (
                    {bigintToNum(stats?.pendingWithdrawalsCount ?? BigInt(0))})
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 text-white"
                >
                  <Package className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-2xl font-black">
                    {products?.length ?? 0}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">Total Products</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-4 text-white"
                >
                  <Wallet className="w-5 h-5 text-white/70 mb-2" />
                  <p className="font-display text-2xl font-black">
                    {allTransactions?.length ?? 0}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5">
                    Total Transactions
                  </p>
                </motion.div>
              </>
            )}
          </div>
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
                <Skeleton key={i} className="h-24 rounded-xl" />
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        {user.isActive ? (
                          <Badge className="badge-direct text-[10px] py-0">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                        {user.role === "admin" && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] py-0">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        +91 {user.mobile}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Code:{" "}
                          <span className="font-semibold text-foreground">
                            {user.referralCode}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Bal:{" "}
                          <span className="font-semibold text-primary">
                            {formatINR(user.walletBalance)}
                          </span>
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Joined: {formatDate(user.joinDate)}
                      </p>
                    </div>
                    <Button
                      data-ocid={`admin.users.edit_button.${i + 1}`}
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary text-xs rounded-lg shrink-0"
                      onClick={() => {
                        setCreditDialog({ open: true, user });
                        setCreditAmount("");
                        setCreditNote("");
                      }}
                    >
                      Credit
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab 3: Withdrawals ────────────────────────────────────────────── */}
        <TabsContent value="withdrawals" className="px-4 pb-8 pt-4">
          {/* Filter chips */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              data-ocid="admin.withdrawals.pending.tab"
              onClick={() => setWithdrawalFilter("pending")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                withdrawalFilter === "pending"
                  ? "gradient-primary border-0 text-white"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
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
                <Skeleton key={i} className="h-32 rounded-xl" />
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
              {withdrawals.map((wr: WithdrawalRequest, i) => (
                <motion.div
                  key={String(wr.reqId)}
                  data-ocid={`admin.withdrawals.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-foreground">
                        {formatINR(wr.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        User ID: …{String(wr.userId).slice(-6)}
                      </p>
                      {wr.bankName && (
                        <p className="text-xs text-muted-foreground">
                          {wr.bankName} • ****{wr.accountNumber.slice(-4)} •{" "}
                          {wr.ifscCode}
                        </p>
                      )}
                      {wr.upiId && (
                        <p className="text-xs text-muted-foreground">
                          UPI: {wr.upiId}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(wr.requestDate)}
                      </p>
                    </div>
                    <StatusBadge status={wr.status} />
                  </div>

                  {wr.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        data-ocid={`admin.withdrawals.confirm_button.${i + 1}`}
                        size="sm"
                        className="flex-1 h-9 gradient-direct border-0 text-white text-xs rounded-lg"
                        onClick={() =>
                          approveWithdrawalMutation.mutate({
                            reqId: wr.reqId,
                            note: "Approved by admin",
                          })
                        }
                        disabled={approveWithdrawalMutation.isPending}
                      >
                        {approveWithdrawalMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                          </>
                        )}
                      </Button>
                      <Button
                        data-ocid={`admin.withdrawals.delete_button.${i + 1}`}
                        size="sm"
                        variant="destructive"
                        className="flex-1 h-9 text-xs rounded-lg"
                        onClick={() => {
                          setRejectDialog({ open: true, reqId: wr.reqId });
                          setRejectNote("");
                        }}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
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
                          {tx.note || `User …${String(tx.userId).slice(-4)}`}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDateTime(tx.timestamp)} • User …
                        {String(tx.userId).slice(-4)}
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

            {/* Parent info preview */}
            <AnimatePresence>
              {parentUser && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-secondary/50 border border-border rounded-2xl p-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Parent Details
                  </p>
                  <p className="font-semibold text-foreground">
                    {parentUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parentUser.mobile}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-card rounded-xl p-3 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                        Left Leg
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {parentUser.leftChildId ? (
                          `User #${String(parentUser.leftChildId).slice(-4)}`
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Empty
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="bg-card rounded-xl p-3 border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                        Right Leg
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {parentUser.rightChildId ? (
                          `User #${String(parentUser.rightChildId).slice(-4)}`
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Empty
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* ── Tab 6: Products ───────────────────────────────────────────────── */}
        <TabsContent value="products" className="px-4 pb-8 pt-4">
          <Button
            data-ocid="admin.products.open_modal_button"
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="w-full h-12 gradient-primary border-0 text-white font-bold rounded-xl mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>

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
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : !products || products.length === 0 ? (
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
              {products.map((product, i) => (
                <motion.div
                  key={String(product.productId)}
                  data-ocid={`admin.products.item.${i + 1}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {product.description}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatINR(product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-semibold ${product.isActive ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {product.isActive ? "Active" : "Off"}
                    </span>
                    <Switch
                      data-ocid={`admin.products.switch.${i + 1}`}
                      checked={product.isActive}
                      onCheckedChange={() =>
                        toggleProductMutation.mutate(product.productId)
                      }
                      disabled={toggleProductMutation.isPending}
                    />
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
                </motion.div>
              ))}
            </div>
          )}
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
            <DialogTitle className="font-display">Credit Income</DialogTitle>
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
