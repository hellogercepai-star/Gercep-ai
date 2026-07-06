export async function adminFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, { credentials: "same-origin", ...init });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function formatUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.0001) return `$${n.toFixed(8)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Balance display — keeps precision when small deductions on large balances */
export function formatBalanceUsd(n: number): string {
  if (n === 0) return "$0.00";
  if (n >= 100) return formatUsd(n);
  return `$${n.toFixed(4)}`;
}

export function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}
