/**
 * Gateway billing & cost protection tests
 * Run: npx tsx lib/services/gateway/gateway.test.ts
 */
import assert from "node:assert/strict";
import {
  calculateTokenCosts,
  estimateCompletionTokens,
  estimatePromptTokens,
} from "./pricing.service";

function testTokenEstimation() {
  const prompt = estimatePromptTokens([
    { role: "user", content: "Hello world" },
  ]);
  assert.ok(prompt >= 1);

  const completion = estimateCompletionTokens(512, 4096);
  assert.equal(completion, 512);
}

function testCostCalculation() {
  const costs = calculateTokenCosts(1000, 500, {
    modelId: "deepseek-chat",
    inputPricePer1M: 0.14,
    outputPricePer1M: 0.28,
    inputCostPer1M: 0.07,
    outputCostPer1M: 0.14,
    defaultMaxOutputTokens: 4096,
    enabled: true,
  });

  assert.ok(costs.providerCostUsd > 0);
  assert.ok(costs.customerChargeUsd > costs.providerCostUsd);
  assert.ok(costs.profitUsd > 0);
  assert.equal(costs.totalTokens, 1500);
}

testTokenEstimation();
testCostCalculation();

console.log("gateway.test.ts — all checks passed");
