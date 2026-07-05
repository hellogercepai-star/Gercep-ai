import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { base64ToBytes } from "@/lib/wallet/sign";

export function buildWalletLinkMessage(input: {
  address: string;
  nonce: string;
  expiresAt: Date;
}): string {
  return [
    "Link wallet to Gercep AI",
    "",
    `Address: ${input.address}`,
    `Nonce: ${input.nonce}`,
    `Expires: ${input.expiresAt.toISOString()}`,
  ].join("\n");
}

export function verifySolanaSignature(input: {
  address: string;
  message: string;
  signatureBase58?: string;
  signatureBase64?: string;
}): boolean {
  try {
    const publicKey = new PublicKey(input.address);
    const messageBytes = new TextEncoder().encode(input.message);
    const signatureBytes = input.signatureBase64
      ? base64ToBytes(input.signatureBase64)
      : bs58.decode(input.signatureBase58!);
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch {
    return false;
  }
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
