import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/context/AppContext";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, UserPlus, Users, XCircle } from "lucide-react";
import { motion } from "motion/react";
import type { User } from "../backend.d";

interface TreeNodeProps {
  user: User | null;
  level: number;
  maxLevel?: number;
  actor: import("../backend.d").backendInterface | null;
}

function TreeNode({ user, level, maxLevel = 3, actor }: TreeNodeProps) {
  const { data: leftChild } = useQuery({
    queryKey: ["user", String(user?.leftChildId)],
    queryFn: async () => {
      if (!actor || !user?.leftChildId) return null;
      try {
        return await actor.getUserById(user.leftChildId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!user?.leftChildId && level < maxLevel,
  });

  const { data: rightChild } = useQuery({
    queryKey: ["user", String(user?.rightChildId)],
    queryFn: async () => {
      if (!actor || !user?.rightChildId) return null;
      try {
        return await actor.getUserById(user.rightChildId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !!user?.rightChildId && level < maxLevel,
  });

  if (!user) {
    return (
      <div className="tree-node empty flex flex-col items-center gap-1">
        <UserPlus className="w-4 h-4 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">Empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className={`tree-node ${user.isActive ? "active" : ""}`}>
        <div className="flex items-center justify-center mb-1">
          {user.isActive ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <XCircle className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
        <p className="text-[11px] font-bold text-foreground leading-tight truncate max-w-[80px]">
          {user.name}
        </p>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          {user.referralCode}
        </p>
      </div>

      {/* Children */}
      {level < maxLevel && (
        <>
          <div className="tree-connector" />
          <div className="flex gap-6">
            {/* Left branch */}
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border" />
              <TreeNode
                user={leftChild ?? null}
                level={level + 1}
                maxLevel={maxLevel}
                actor={actor}
              />
            </div>

            {/* Right branch */}
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-border" />
              <TreeNode
                user={rightChild ?? null}
                level={level + 1}
                maxLevel={maxLevel}
                actor={actor}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { actor, isFetching } = useActor();
  const { currentUser } = useAppContext();

  const userId = currentUser?.userId;

  const { data: leftUser } = useQuery({
    queryKey: ["user", String(currentUser?.leftChildId)],
    queryFn: async () => {
      if (!actor || !currentUser?.leftChildId) return null;
      try {
        return await actor.getUserById(currentUser.leftChildId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!currentUser?.leftChildId,
  });

  const { data: rightUser } = useQuery({
    queryKey: ["user", String(currentUser?.rightChildId)],
    queryFn: async () => {
      if (!actor || !currentUser?.rightChildId) return null;
      try {
        return await actor.getUserById(currentUser.rightChildId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!currentUser?.rightChildId,
  });

  const leftCount = leftUser ? 1 : 0;
  const rightCount = rightUser ? 1 : 0;
  const pairs = Math.min(leftCount, rightCount);

  if (!userId) {
    return (
      <div className="app-shell bg-background flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground">Please login to view team</p>
      </div>
    );
  }

  return (
    <div className="app-shell bg-background page-content">
      {/* Header */}
      <div className="gradient-primary px-4 pt-14 pb-6">
        <h1 className="font-display text-2xl font-bold text-white">My Team</h1>
        <p className="text-white/60 text-sm mt-1">Binary Network Tree</p>

        {/* Team stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Left Team", value: leftCount, ocid: "team.left_count" },
            {
              label: "Right Team",
              value: rightCount,
              ocid: "team.right_count",
            },
            { label: "Pairs", value: pairs, ocid: undefined },
          ].map(({ label, value, ocid }) => (
            <div
              key={label}
              data-ocid={ocid}
              className="bg-white/10 rounded-xl p-3 text-center"
            >
              <p className="text-white font-display text-2xl font-bold">
                {value}
              </p>
              <p className="text-white/60 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Binary Tree */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-foreground">
            Network Tree
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Active</span>
            <XCircle className="w-3 h-3" />
            <span>Inactive</span>
          </div>
        </div>

        <motion.div
          data-ocid="team.tree_panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-6 overflow-x-auto"
        >
          {isFetching ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-16 w-24 rounded-xl" />
              <div className="flex gap-6">
                <Skeleton className="h-16 w-24 rounded-xl" />
                <Skeleton className="h-16 w-24 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center min-w-max mx-auto">
              {/* Root user */}
              <div
                className={`tree-node ${currentUser?.isActive ? "active" : ""}`}
              >
                <div className="flex items-center justify-center mb-1">
                  {currentUser?.isActive ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-[11px] font-bold text-primary">You</p>
                <p className="text-[9px] text-muted-foreground">
                  {currentUser?.referralCode}
                </p>
              </div>

              <div className="tree-connector" />

              {/* Left and Right children row */}
              <div className="flex gap-8 items-start">
                {/* Left subtree */}
                <div className="flex flex-col items-center">
                  <div className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full mb-2">
                    LEFT
                  </div>
                  <TreeNode
                    user={leftUser ?? null}
                    level={1}
                    maxLevel={3}
                    actor={actor}
                  />
                </div>

                {/* Right subtree */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full mb-2">
                    RIGHT
                  </div>
                  <TreeNode
                    user={rightUser ?? null}
                    level={1}
                    maxLevel={3}
                    actor={actor}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Info Card */}
        <div className="mt-4 bg-secondary/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Binary Pair Income
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Earn <span className="font-bold text-foreground">₹200</span> for
                every matching pair (1 left + 1 right active member).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
