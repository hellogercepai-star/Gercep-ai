/** Normalisasi signature bytes dari berbagai wallet provider. */
export function normalizeSignatureBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (
    value &&
    typeof value === "object" &&
    "signature" in value &&
    (value as { signature: unknown }).signature instanceof Uint8Array
  ) {
    return (value as { signature: Uint8Array }).signature;
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
  ) => Promise<{ signature: Uint8Array } | Uint8Array>;
}

/** Sign via Phantom in-app browser (lebih stabil di mobile daripada adapter saja). */
export async function signWithPhantom(message: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(message);
  const phantom = (window as Window & { solana?: PhantomProvider }).solana;

  if (phantom?.isPhantom && phantom.signMessage) {
    const result = await phantom.signMessage(encoded, "utf8");
    return normalizeSignatureBytes(result);
  }

  throw new Error("Phantom signMessage tidak tersedia.");
}
