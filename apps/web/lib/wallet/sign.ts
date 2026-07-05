import bs58 from "bs58";

/** Normalisasi signature bytes dari berbagai wallet provider. */
export function normalizeSignatureBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (typeof value === "string") {
    return bs58.decode(value);
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("signature" in obj) {
      return normalizeSignatureBytes(obj.signature);
    }
  }
  throw new Error("Format signature wallet tidak dikenali.");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toBase58(): string };
  signMessage?: (
    message: Uint8Array,
    display?: string
  ) => Promise<{ signature: Uint8Array | string } | Uint8Array | string>;
}

function getPhantom(): PhantomProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { solana?: PhantomProvider }).solana;
}

/** Sign via Phantom in-app browser — coba beberapa format API (mobile beda-beda). */
export async function signWithPhantom(message: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(message);
  const phantom = getPhantom();

  if (!phantom?.isPhantom || !phantom.signMessage) {
    throw new Error("Phantom signMessage tidak tersedia.");
  }

  const attempts: Array<() => Promise<unknown>> = [
    () => phantom.signMessage!(encoded),
    () => phantom.signMessage!(encoded, "utf8"),
  ];

  let lastErr: unknown;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      return normalizeSignatureBytes(result);
    } catch (err) {
      lastErr = err;
    }
  }

  const msg =
    lastErr instanceof Error
      ? lastErr.message
      : "Sign message gagal di Phantom.";
  throw new Error(msg);
}

export async function signWalletMessage(
  message: string,
  adapterSignMessage?: (msg: Uint8Array) => Promise<Uint8Array | { signature: Uint8Array }>
): Promise<Uint8Array> {
  if (adapterSignMessage) {
    const encoded = new TextEncoder().encode(message);
    const result = await adapterSignMessage(encoded);
    return normalizeSignatureBytes(result);
  }

  const phantom = getPhantom();
  if (phantom?.isPhantom && phantom.signMessage) {
    return signWithPhantom(message);
  }

  throw new Error("Wallet tidak support sign message.");
}
