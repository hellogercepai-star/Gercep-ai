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
  { id: "gpt-5", label: "GPT 5", ownedBy: "openai", status: "live" },
  { id: "gpt-4o", label: "GPT 4o", ownedBy: "openai", status: "live" },
  { id: "gpt-4.1", label: "GPT 4.1", ownedBy: "openai", status: "live" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", ownedBy: "google", status: "live" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", ownedBy: "google", status: "live" },
  { id: "grok-3", label: "Grok 3", ownedBy: "xai", status: "live" },
  { id: "grok-2", label: "Grok 2", ownedBy: "xai", status: "live" },
  {
    id: "meta/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    ownedBy: "nvidia",
    status: "live",
  },
  {
    id: "nvidia/nemotron-mini-4b-instruct",
    label: "Nemotron Mini",
    ownedBy: "nvidia",
    status: "live",
  },
  { id: "claude-sonnet", label: "Claude Sonnet", ownedBy: "anthropic", status: "coming_soon" },
  { id: "qwen-max", label: "Qwen Max", ownedBy: "alibaba", status: "coming_soon" },
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
