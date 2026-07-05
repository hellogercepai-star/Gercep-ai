export interface GatewayModel {
  id: string;
  object: "model";
  owned_by: string;
  status: "live" | "coming_soon";
}

export interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  createdAt: Date;
  revokedAt?: Date;
  lastUsedAt?: Date;
}

export interface UsageLogRecord {
  id: string;
  apiKeyId: string;
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: Date;
}

export interface ValidatedApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
}
