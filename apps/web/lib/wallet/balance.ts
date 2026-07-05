import { Connection, PublicKey } from "@solana/web3.js";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export function getGercepMintAddress(): string | null {
  return process.env.GERCEP_TOKEN_MINT?.trim() || null;
}

export function getTokenDecimals(): number {
  const n = Number(process.env.GERCEP_TOKEN_DECIMALS ?? "9");
  return Number.isFinite(n) && n >= 0 ? n : 9;
}

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || DEFAULT_RPC;
}

/** Baca SPL token balance wallet di mainnet. Null jika mint belum dikonfigurasi. */
export async function fetchGercepBalance(
  walletAddress: string
): Promise<{ balance: number; mint: string } | null> {
  const mint = getGercepMintAddress();
  if (!mint) return null;

  const connection = new Connection(getRpcUrl(), "confirmed");
  const owner = new PublicKey(walletAddress);
  const mintKey = new PublicKey(mint);
  const decimals = getTokenDecimals();

  const { value: accounts } = await connection.getParsedTokenAccountsByOwner(
    owner,
    { mint: mintKey }
  );

  let raw = BigInt(0);
  for (const { account } of accounts) {
    const amount = account.data.parsed?.info?.tokenAmount?.amount;
    if (amount) raw += BigInt(amount);
  }

  const balance = Number(raw) / 10 ** decimals;
  return { balance, mint };
}
