import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, User, Users, Wallet } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/team", label: "Team", icon: Users },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/products", label: "Products", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export default function BottomNav() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl touch-target transition-colors"
              data-ocid={`nav.${label.toLowerCase()}.link`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "gradient-primary text-white shadow-glow-violet"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
