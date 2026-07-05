import { Connection, PublicKey } from "@solana/web3.js";
import { isValidSolanaAddress } from "@/lib/wallet/solana";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";
const RPC_TIMEOUT_MS = 12_000;

export function getGercepMintAddress(): string | null {
  const mint = process.env.GERCEP_TOKEN_MINT?.trim();
  if (!mint) return null;
  if (!isValidSolanaAddress(mint)) return null;
  return mint;
}

export function getTokenDecimals(): number {
  const n = Number(process.env.GERCEP_TOKEN_DECIMALS ?? "9");
  return Number.isFinite(n) && n >= 0 ? n : 9;
}

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || DEFAULT_RPC;
}

export type GercepBalanceResult =
  | { status: "unconfigured" }
  | { status: "ok"; balance: number; mint: string }
  | {
      status: "error";
      reason: "invalid_wallet" | "invalid_mint" | "rpc";
    };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("RPC timeout")), ms)
    ),
  ]);
}

/** Baca SPL token balance — hasil terstruktur untuk UI & quota tier. */
export async function fetchGercepBalanceResult(
  walletAddress: string
): Promise<GercepBalanceResult> {
  const mint = getGercepMintAddress();
  if (!mint) return { status: "unconfigured" };

  const address = walletAddress?.trim();
  if (!address || !isValidSolanaAddress(address)) {
    return { status: "error", reason: "invalid_wallet" };
  }

  try {
    const connection = new Connection(getRpcUrl(), "confirmed");
    const owner = new PublicKey(address);
    const mintKey = new PublicKey(mint);
    const decimals = getTokenDecimals();

    const { value: accounts } = await withTimeout(
      connection.getParsedTokenAccountsByOwner(owner, { mint: mintKey }),
      RPC_TIMEOUT_MS
    );

    let raw = BigInt(0);
    for (const { account } of accounts) {
      const amount = account.data.parsed?.info?.tokenAmount?.amount;
      if (amount) raw += BigInt(amount);
    }

    const balance = Number(raw) / 10 ** decimals;
    if (!Number.isFinite(balance)) {
      return { status: "error", reason: "rpc" };
    }

    return { status: "ok", balance, mint };
  } catch {
    return { status: "error", reason: "rpc" };
  }
}

/** @deprecated Prefer fetchGercepBalanceResult for explicit error handling. */
export async function fetchGercepBalance(
  walletAddress: string
): Promise<{ balance: number; mint: string } | null> {
  const result = await fetchGercepBalanceResult(walletAddress);
  if (result.status === "ok") {
    return { balance: result.balance, mint: result.mint };
  }
  return null;
}
