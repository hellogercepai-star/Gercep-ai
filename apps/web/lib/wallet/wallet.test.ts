/**
 * Lightweight wallet module checks — run: npx tsx lib/wallet/wallet.test.ts
 */
import assert from "node:assert/strict";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import {
  buildChallengeMessage,
  extractAddressFromLinkMessage,
  isChallengeExpired,
} from "./challenge";
import {
  buildWalletLinkMessage,
  isValidSolanaAddress,
  verifySolanaSignature,
} from "./solana";
import { resolveQuotaTier, tierForBalance } from "./tiers";
import { getGercepMintAddress } from "./balance";

function testSignatureRoundTrip() {
  const kp = Keypair.generate();
  const address = kp.publicKey.toBase58();
  const message = buildWalletLinkMessage({
    address,
    nonce: "test-nonce-123",
    expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    domain: "gercep-ai.vercel.app",
  });
  const sig = nacl.sign.detached(
    new TextEncoder().encode(message),
    kp.secretKey
  );

  assert.equal(isValidSolanaAddress(address), true);
  assert.equal(isValidSolanaAddress("not-a-wallet"), false);
  assert.equal(extractAddressFromLinkMessage(message), address);
  assert.equal(
    verifySolanaSignature({
      address,
      message,
      signatureBase58: bs58.encode(sig),
    }),
    true
  );
  assert.equal(
    verifySolanaSignature({
      address,
      message: message + "tampered",
      signatureBase58: bs58.encode(sig),
    }),
    false
  );
}

function testChallengeExpiry() {
  assert.equal(isChallengeExpired(new Date(Date.now() - 1000)), true);
  assert.equal(isChallengeExpired(new Date(Date.now() + 60_000)), false);
}

function testQuotaTiers() {
  assert.equal(tierForBalance(0).id, "beta");
  assert.equal(tierForBalance(1).id, "holder");
  assert.equal(tierForBalance(10_000).id, "supporter");
  assert.equal(tierForBalance(100_000).id, "whale");
  assert.equal(resolveQuotaTier({ walletLinked: false, gercepBalance: 999 }).id, "beta");
  assert.equal(resolveQuotaTier({ walletLinked: true, gercepBalance: 5_000 }).id, "holder");
  assert.equal(resolveQuotaTier({ walletLinked: true, gercepBalance: null }).id, "beta");
}

function testMintGraceful() {
  const mint = getGercepMintAddress();
  assert.ok(mint === null || typeof mint === "string");
}

testSignatureRoundTrip();
testChallengeExpiry();
testQuotaTiers();
testMintGraceful();

console.log("wallet.test.ts — all checks passed");
