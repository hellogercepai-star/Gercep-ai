export interface ShowcaseModel {
  id: string;
  label: string;
  ownedBy: string;
  status: "live" | "coming_soon";
}

/** Model cards untuk marketing — hanya model live yang bisa dipanggil via API. */
export const SHOWCASE_MODELS: ShowcaseModel[] = [
  { id: "deepseek-chat", label: "DeepSeek Chat", ownedBy: "deepseek", status: "live" },
  { id: "deepseek-reasoner", label: "DeepSeek Reasoner", ownedBy: "deepseek", status: "live" },
  { id: "gpt-4o", label: "GPT 4o", ownedBy: "openai", status: "coming_soon" },
  { id: "claude-sonnet", label: "Claude Sonnet", ownedBy: "anthropic", status: "coming_soon" },
  { id: "gemini-pro", label: "Gemini Pro", ownedBy: "google", status: "coming_soon" },
  { id: "qwen-max", label: "Qwen Max", ownedBy: "alibaba", status: "coming_soon" },
  { id: "llama-3", label: "Llama 3", ownedBy: "meta", status: "coming_soon" },
  { id: "mistral-large", label: "Mistral Large", ownedBy: "mistral", status: "coming_soon" },
];

export const TRUSTED_BY = [
  "Superteam Indonesia",
  "Solana builders",
  "AI agents",
  "Token apps",
  "Inference teams",
  "Router users",
  "Realtime apps",
  "Open-source agents",
];
