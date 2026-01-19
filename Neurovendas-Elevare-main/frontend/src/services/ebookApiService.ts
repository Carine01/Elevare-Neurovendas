// Camada centralizada de API para geração de eBooks
// Encapsula lógica de chamadas à API, retry, normalização de erros

import { EbookConteudo, AnthropicResponse } from "@/types/ebook";
import { ebookObservability } from "@/services/ebookObservability";

export class EbookApiError extends Error {
  constructor(
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(`[${code}] ${originalError?.message || "Erro desconhecido"}`);
    this.name = "EbookApiError";
  }
}

const ANTHROPIC_API_URL = import.meta.env.VITE_ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_API_VERSION = import.meta.env.VITE_ANTHROPIC_API_VERSION || "2023-06-01";
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class EbookApiService {
  private abortController: AbortController | null = null;

  /**
   * Gera e-book estratégico via Anthropic API
   * @param prompt Prompt estruturado para geração
   * @throws EbookApiError em caso de falha
   */
  async generateEbook(prompt: string): Promise<EbookConteudo> {
    if (!ANTHROPIC_API_KEY) {
      throw new EbookApiError(
        "MISSING_API_KEY",
        undefined,
        new Error("VITE_ANTHROPIC_API_KEY não configurada")
      );
    }

    this.abortController = new AbortController();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.callAnthropicApi(prompt, this.abortController.signal);
        const duration = Date.now() - startTime;

        ebookObservability.trackStepComplete(4, duration);

        return response;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof EbookApiError) {
          // Erros específicos não devem fazer retry
          if (["MISSING_API_KEY", "INVALID_RESPONSE", "PARSE_ERROR"].includes(error.code)) {
            throw error;
          }
        }

        if (attempt < MAX_RETRIES) {
          const delayMs = RETRY_DELAY_MS * attempt;
          console.warn(`[EbookAPI] Tentativa ${attempt}/${MAX_RETRIES} falhou. Aguardando ${delayMs}ms...`, error);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }

    throw new EbookApiError("MAX_RETRIES_EXCEEDED", undefined, lastError ?? undefined);
  }

  private async callAnthropicApi(prompt: string, signal: AbortSignal): Promise<EbookConteudo> {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 6000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new EbookApiError(
        "API_ERROR",
        response.status,
        new Error(`HTTP ${response.status}: ${errorText.slice(0, 400)}`)
      );
    }

    const data: AnthropicResponse = await response.json();
    return this.parseResponse(data);
  }

  private parseResponse(data: AnthropicResponse): EbookConteudo {
    const contentText = (data.content ?? [])
      .filter((item) => item.type === "text" && item.text)
      .map((item) => item.text ?? "")
      .join("\n")
      .trim();

    if (!contentText) {
      throw new EbookApiError("EMPTY_RESPONSE", undefined, new Error("Modelo retornou resposta vazia"));
    }

    return this.parseEbookPayload(contentText);
  }

  private parseEbookPayload(rawText: string): EbookConteudo {
    const jsonText = this.extractJsonFromText(rawText);
    if (!jsonText) {
      throw new EbookApiError("PARSE_ERROR", undefined, new Error("Nenhum JSON encontrado na resposta"));
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      throw new EbookApiError(
        "JSON_PARSE_ERROR",
        undefined,
        new Error(`JSON inválido: ${(e as Error).message}`)
      );
    }

    if (!this.isValidEbookConteudo(parsed)) {
      throw new EbookApiError(
        "INVALID_RESPONSE",
        undefined,
        new Error("Resposta fora do formato esperado")
      );
    }

    return parsed;
  }

  private extractJsonFromText(text: string): string {
    const withoutFences = text.replace(/```json|```/g, "").trim();
    const match = withoutFences.match(/\{[\s\S]*\}/);
    return match ? match[0] : "";
  }

  private isValidEbookConteudo(payload: unknown): payload is EbookConteudo {
    if (!payload || typeof payload !== "object") return false;
    const data = payload as Partial<EbookConteudo>;
    return (
      typeof data.titulo === "string" &&
      typeof data.subtitulo === "string" &&
      Array.isArray(data.capitulos) &&
      data.capitulos.length > 0 &&
      typeof data.introducao === "object" &&
      typeof data.conclusao === "object" &&
      typeof data.metadata_estrategica === "object"
    );
  }

  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  isRunning(): boolean {
    return this.abortController !== null && !this.abortController.signal.aborted;
  }
}

export const ebookApiService = new EbookApiService();
