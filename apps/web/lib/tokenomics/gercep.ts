export const GERCEP_SUPPLY = {
  total: 1_000_000_000,
  decimals: 9,
  chain: "Solana mainnet",
  standard: "SPL Token",
} as const;

export interface AllocationBucket {
  id: string;
  label: string;
  percent: number;
  tokens: number;
  purpose: string;
}

export interface VestingSchedule {
  bucket: string;
  tgeUnlock: string;
  cliff: string;
  vestingDuration: string;
  release: string;
}

/** Proposed allocation — subject to change before TGE. */
export const GERCEP_ALLOCATION: AllocationBucket[] = [
  {
    id: "community",
    label: "Community & Airdrop",
    percent: 35,
    tokens: 350_000_000,
    purpose:
      "Early wallet linkers, gateway users, Phantom ecosystem, and public airdrop campaigns.",
  },
  {
    id: "ecosystem",
    label: "Ecosystem & Gateway Rewards",
    percent: 25,
    tokens: 250_000_000,
    purpose:
      "Quota-tier incentives, builder grants, hackathons, and compute-credit rebates.",
  },
  {
    id: "liquidity",
    label: "Liquidity (DEX)",
    percent: 10,
    tokens: 100_000_000,
    purpose:
      "Initial Raydium / Jupiter pool seeding and market-making support at launch.",
  },
  {
    id: "treasury",
    label: "Treasury & Operations",
    percent: 12,
    tokens: 120_000_000,
    purpose:
      "Infrastructure (RPC, GPU, provider keys), security audits, and runway.",
  },
  {
    id: "team",
    label: "Team",
    percent: 15,
    tokens: 150_000_000,
    purpose: "Core contributors — long vesting aligned with gateway growth.",
  },
  {
    id: "advisors",
    label: "Advisors & Partners",
    percent: 3,
    tokens: 30_000_000,
    purpose: "Strategic partners, technical advisors, and integration grants.",
  },
];

export const GERCEP_VESTING: VestingSchedule[] = [
  {
    bucket: "Community & Airdrop",
    tgeUnlock: "10% at TGE",
    cliff: "None",
    vestingDuration: "12 months linear",
    release: "Remaining 90% streamed monthly to eligible wallets",
  },
  {
    bucket: "Ecosystem & Gateway Rewards",
    tgeUnlock: "5% at TGE",
    cliff: "3 months",
    vestingDuration: "36 months linear",
    release: "Emissions tied to active API usage milestones",
  },
  {
    bucket: "Liquidity (DEX)",
    tgeUnlock: "100% at TGE",
    cliff: "None",
    vestingDuration: "Immediate (LP locked 6 months)",
    release: "LP tokens locked via on-chain locker; team cannot rug pool",
  },
  {
    bucket: "Treasury & Operations",
    tgeUnlock: "0% at TGE",
    cliff: "6 months",
    vestingDuration: "30 months linear",
    release: "Multisig-controlled releases for ops and provider costs",
  },
  {
    bucket: "Team",
    tgeUnlock: "0% at TGE",
    cliff: "12 months",
    vestingDuration: "36 months linear",
    release: "Monthly unlock after cliff; no transfers before cliff ends",
  },
  {
    bucket: "Advisors & Partners",
    tgeUnlock: "0% at TGE",
    cliff: "6 months",
    vestingDuration: "24 months linear",
    release: "Milestone-based unlocks for partnership deliverables",
  },
];

export function formatTokenAmount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  return n.toLocaleString("en-US");
}
