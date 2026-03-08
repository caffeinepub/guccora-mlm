import { useAppContext } from "@/context/AppContext";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/login" });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="app-shell bg-background min-h-dvh">
      <Outlet />
      <BottomNav />
    </div>
  );
}
