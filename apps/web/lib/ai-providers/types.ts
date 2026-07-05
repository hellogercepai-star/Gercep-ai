// Kontrak standar yang harus dipenuhi setiap provider AI.
// Dengan interface ini, nambah provider baru (Gemini, NVIDIA, dll)
// tinggal bikin file baru yang implement AIProvider — endpoint tidak perlu diubah.

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Format response mengikuti OpenAI supaya customer bisa pakai SDK OpenAI
// tanpa ubah kode — cukup ganti base URL ke gateway kita.
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIProvider {
  // nama provider (untuk logging & routing)
  name: string;
  // daftar model yang didukung provider ini
  supportedModels: string[];
  // eksekusi chat completion
  createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse>;
}
