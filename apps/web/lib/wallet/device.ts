/** Deteksi mobile browser (bukan Phantom in-app browser). */
export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Phantom inject `window.solana` di extension & in-app browser. */
export function hasInjectedSolanaWallet(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as Window & { solana?: { isPhantom?: boolean } }).solana?.isPhantom
  );
}

/** Buka halaman ini di Phantom mobile in-app browser (wallet connect jalan di sana). */
export function getPhantomBrowseUrl(pageUrl: string): string {
  const encoded = encodeURIComponent(pageUrl);
  const ref = encodeURIComponent(
    pageUrl.split("/developers")[0] || pageUrl
  );
  return `https://phantom.app/ul/browse/${encoded}?ref=${ref}`;
}

export const PHANTOM_EXTENSION_URL =
  "https://phantom.app/download";

/** URL untuk buka di Phantom mobile — login dulu, baru link wallet. */
export function getPhantomDevelopersUrl(siteOrigin: string): string {
  const loginUrl = `${siteOrigin}/login?next=${encodeURIComponent("/developers")}&wallet=1`;
  return getPhantomBrowseUrl(loginUrl);
}
