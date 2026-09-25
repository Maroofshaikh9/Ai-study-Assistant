import { MAX_TEXT_CHARS } from "./constants";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function shortenText(text: string): string {
  if (text.length <= MAX_TEXT_CHARS) {
    return text;
  }
  return text.slice(0, MAX_TEXT_CHARS) + "\n\n[Notes truncated for length]";
}

export function extractJson(text: string) {
  const cleaned = text.replace(/```json/gi, "```").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("The AI did not return a valid result. Please try again.");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

const FALLBACK_MODELS = [
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b"
];

function getModelsToTry(): string[] {
  const configured = process.env.GROQ_MODEL?.trim();
  if (configured) {
    return [configured, ...FALLBACK_MODELS.filter((m) => m !== configured)];
  }
  return FALLBACK_MODELS;
}

export async function callGroq(
  messages: ChatMessage[],
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI is not configured. Set GROQ_API_KEY in the environment."
    );
  }

  let lastTechnicalError: Error | null = null;
  let isTechnicalFailure = false;

  const models = getModelsToTry();
  for (const model of models) {
    try {
      console.log(`[Groq] Attempting model: ${model}`);
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages,
            temperature: 0.3,
            ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error(`[Groq] Model failed: ${model} with status: ${response.status}`);
        
        if ([403, 404, 429, 500, 502, 503].includes(response.status)) {
          isTechnicalFailure = true;
          lastTechnicalError = new Error(data?.error?.message || "The AI service is temporarily unavailable.");
          console.log(`[Groq] Trying fallback model if available...`);
          continue; 
        } else {
          throw new Error(data?.error?.message || "Invalid request to AI service.");
        }
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("The AI returned an empty response.");
      }

      console.log(`[Groq] Success using ${model}`);
      return content;
      
    } catch (error) {
      if (error instanceof TypeError) {
        console.error(`[Groq] Network error with model: ${model}`);
        isTechnicalFailure = true;
        lastTechnicalError = error;
        console.log(`[Groq] Trying fallback model if available...`);
        continue;
      }
      throw error;
    }
  }

  if (isTechnicalFailure) {
    throw new Error("AI service is temporarily busy. Please try again in a moment.");
  }
  
  throw lastTechnicalError || new Error("Failed to generate response.");
}
