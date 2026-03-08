import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Shield, Star, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";

export default function SplashPage() {
  return (
    <div className="splash-bg min-h-dvh flex flex-col items-center justify-between px-6 pt-16 pb-12 app-shell">
      {/* Hero section */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            type: "spring",
            stiffness: 200,
          }}
          className="mb-6"
        >
          <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto shadow-glow-violet mb-4 overflow-hidden">
            <img
              src="/assets/uploads/file_000000003e8c71fab2239f767299f90d-1.png"
              alt="Guccora MLM Network"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="font-display text-5xl font-black text-white tracking-tight">
            GUCCORA
          </h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Star
                key={k}
                className="w-3 h-3 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-white/90 text-xl font-semibold leading-tight mb-2">
            Build Your Network,
          </p>
          <p className="text-white/90 text-xl font-semibold leading-tight">
            Build Your Future
          </p>
          <p className="text-white/60 text-sm mt-3 max-w-xs mx-auto">
            Join India's fastest-growing premium MLM network with binary plan &
            10-level income
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="grid grid-cols-2 gap-3 w-full max-w-xs"
        >
          {[
            {
              icon: TrendingUp,
              label: "₹100 Direct Income",
              color:
                "from-emerald-500/20 to-emerald-600/20 border-emerald-400/30",
            },
            {
              icon: Users,
              label: "₹200 Binary Income",
              color: "from-blue-500/20 to-blue-600/20 border-blue-400/30",
            },
            {
              icon: Shield,
              label: "10 Level Income",
              color: "from-amber-500/20 to-amber-600/20 border-amber-400/30",
            },
            {
              icon: Star,
              label: "Premium Products",
              color: "from-purple-500/20 to-purple-600/20 border-purple-400/30",
            },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className={`flex items-center gap-2 bg-gradient-to-br ${color} border rounded-xl px-3 py-2.5 backdrop-blur-sm`}
            >
              <Icon className="w-4 h-4 text-white/80 shrink-0" />
              <span className="text-white/90 text-xs font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Joining amount badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-6 bg-white/10 border border-white/20 rounded-full px-5 py-2"
        >
          <span className="text-white/70 text-sm">Join for only </span>
          <span className="text-yellow-300 font-bold text-base">₹599</span>
          <span className="text-white/70 text-sm"> with product</span>
        </motion.div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        className="w-full max-w-xs space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <Link to="/register" className="block">
          <Button
            data-ocid="splash.register_button"
            size="lg"
            className="w-full h-14 text-base font-bold gradient-gold text-gray-900 border-0 rounded-2xl shadow-lg hover:opacity-90 touch-target"
          >
            Join Now — ₹599
          </Button>
        </Link>
        <Link to="/login" className="block">
          <Button
            data-ocid="splash.login_button"
            variant="outline"
            size="lg"
            className="w-full h-14 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-2xl touch-target"
          >
            Login to Account
          </Button>
        </Link>
        <p className="text-center text-white/40 text-xs mt-2">
          © {new Date().getFullYear()} Guccora. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
