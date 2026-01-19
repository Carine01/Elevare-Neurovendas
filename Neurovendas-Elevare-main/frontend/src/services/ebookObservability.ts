// Instrumentação e observabilidade para o gerador de eBooks
// Fornece um padrão centralizado para logging, métricas e rastreamento

export interface EventMetadata {
  timestamp: number;
  duration?: number;
  step?: number;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface EbookGenerationMetric {
  eventType: "start" | "step_complete" | "error" | "success" | "cancel";
  metadata: EventMetadata;
}

class EbookObservability {
  private enabled: boolean;
  private endpoint: string;
  private sessionId: string;

  constructor() {
    this.enabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true";
    this.endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || "";
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackGenerationStart(formData: Record<string, unknown>): void {
    this.track("start", {
      objetivo: formData.tipoObjetivo,
      especialidade: formData.especialidade,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }

  trackStepComplete(stepNumber: number, duration: number): void {
    this.track("step_complete", {
      step: stepNumber,
      duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }

  trackError(error: Error, context: Record<string, unknown>): void {
    this.track("error", {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });

    // Log local para debugging
    console.error("[Ebook Generation Error]", error, context);
  }

  trackSuccess(totalDuration: number, capitulos: number): void {
    this.track("success", {
      totalDuration,
      capitulos,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }

  trackCancel(reason: string): void {
    this.track("cancel", {
      reason,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }

  private track(eventType: string, metadata: Record<string, unknown>): void {
    if (!this.enabled || !this.endpoint) {
      console.debug("[Observability]", eventType, metadata);
      return;
    }

    // Fire-and-forget: não bloqueia a UX
    fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.warn("[Analytics] Falha ao enviar métrica:", err);
    });
  }
}

export const ebookObservability = new EbookObservability();
