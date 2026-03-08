import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { formatINR } from "@/utils/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Package, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function ProductsPage() {
  const { actor, isFetching } = useActor();
  const { currentUser, setCurrentUser } = useAppContext();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor || !currentUser) throw new Error("Not connected");
      await actor.purchaseProduct(currentUser.userId, productId);
      const updated = await actor.getUserById(currentUser.userId);
      return updated;
    },
    onSuccess: (updated) => {
      setCurrentUser(updated);
      toast.success("Product purchased successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Purchase failed");
    },
  });

  const activeProducts = products?.filter((p) => p.isActive) || [];

  const productGradients = [
    "gradient-direct",
    "gradient-binary",
    "gradient-level",
    "gradient-wallet",
    "gradient-primary",
  ];

  return (
    <div className="app-shell bg-background page-content">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">Products</h1>
        <p className="text-white/60 text-sm mt-1">Premium Guccora Collection</p>

        {/* Account status */}
        {currentUser?.isActive ? (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <p className="text-emerald-200 text-sm font-medium">
              Account Active — Earning enabled
            </p>
          </div>
        ) : (
          <div className="mt-4 bg-amber-500/20 border border-amber-400/30 rounded-xl p-3">
            <p className="text-amber-200 text-sm font-medium">
              Purchase a product to activate your account and start earning
            </p>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div
            data-ocid="products.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No products available</p>
            <p className="text-sm mt-1">Check back soon for new products</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeProducts.map((product, i) => (
              <motion.div
                key={String(product.productId)}
                data-ocid={
                  i === 0
                    ? "products.item.1"
                    : i === 1
                      ? "products.item.2"
                      : undefined
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
              >
                {/* Product color header */}
                <div
                  className={`${productGradients[i % productGradients.length]} p-5 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-display font-bold text-lg">
                        {product.name}
                      </p>
                      {currentUser?.isActive && (
                        <Badge className="bg-white/20 text-white border-0 text-xs mt-0.5">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Joined
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-display text-2xl font-black">
                      {formatINR(product.price)}
                    </p>
                    <p className="text-white/60 text-xs">one-time</p>
                  </div>
                </div>

                {/* Product details */}
                <div className="p-4">
                  <p className="text-muted-foreground text-sm">
                    {product.description}
                  </p>

                  {/* Benefits list */}
                  <div className="mt-3 space-y-1.5">
                    {[
                      "₹100 direct income per referral",
                      "₹200 binary pair income",
                      "Level income up to 10 levels",
                      "Premium member access",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs text-foreground">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    data-ocid={i === 0 ? "products.buy_button.1" : undefined}
                    onClick={() => purchaseMutation.mutate(product.productId)}
                    disabled={purchaseMutation.isPending}
                    className="w-full mt-4 h-12 gradient-primary border-0 text-white font-bold rounded-xl"
                  >
                    {purchaseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
