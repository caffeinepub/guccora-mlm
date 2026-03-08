/**
 * Format a number as Indian currency (₹X,XX,XXX)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a bigint timestamp (nanoseconds) to a date string
 */
export function formatDate(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

/**
 * Format a bigint timestamp to a short date/time
 */
export function formatDateTime(timestamp: bigint | number): string {
  const ms =
    typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : timestamp;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

/**
 * Get user initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Get transaction type label
 */
export function getTxTypeLabel(txType: string): string {
  const labels: Record<string, string> = {
    direct_income: "Direct Income",
    binary_income: "Binary Income",
    level_income: "Level Income",
    withdrawal: "Withdrawal",
    joining: "Joining Fee",
  };
  return labels[txType] || txType;
}

/**
 * Get badge class for transaction type
 */
export function getTxBadgeClass(txType: string): string {
  const classes: Record<string, string> = {
    direct_income: "badge-direct",
    binary_income: "badge-binary",
    level_income: "badge-level",
    withdrawal: "badge-withdrawal",
    joining: "badge-joining",
  };
  return classes[txType] || "badge-joining";
}

/**
 * Format bigint as string (for display purposes)
 */
export function bigintToNum(value: bigint | undefined | null): number {
  if (value === undefined || value === null) return 0;
  return Number(value);
}
