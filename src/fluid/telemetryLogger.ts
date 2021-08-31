import type {
    ITelemetryBaseEvent,
    ITelemetryBaseLogger,
    ITelemetryGenericEvent,
    TelemetryEventCategory,
} from "@fluidframework/common-definitions";
import stringifySafe from "json-stringify-safe";

export class TelemetryLogger implements ITelemetryBaseLogger {
    private readonly pendingEvents: ITelemetryGenericEvent[] = [];
    private lastLogsSentAt: number = Date.now();
    private docId: string | undefined;

    constructor(
        private readonly endpoint: string,
        private readonly batchLimit = 10,
        private readonly maxLogIntervalInMs = 1000000
    ) {
        window.addEventListener("beforeunload", () => {
            this.sendPending();
        });
    }

    public setDocId(docId: string): void {
        this.docId = docId;
    }

    public send(event: ITelemetryBaseEvent): void {
        if (!["generic", "error", "performance"].includes(event.category)) {
            return;
        }
        this.pendingEvents.push({
            ...event,
            category: event.category as TelemetryEventCategory,
            timestamp: Date.now(),
        });
        if (
            this.pendingEvents.length >= this.batchLimit ||
            Date.now() - this.lastLogsSentAt > this.maxLogIntervalInMs
        ) {
            void this.sendPending();
        }
    }

    private async sendPending(): Promise<any> {
        if (!this.docId) {
            return;
        }
        if (!this.pendingEvents.length || !this.endpoint) {
            return;
        }

        this.lastLogsSentAt = Date.now();
        // retrieve and clear pending events
        const events = this.pendingEvents.splice(0, this.pendingEvents.length);
        return fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: stringifySafe({ sessionId: this.docId, log: events }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `Telemetry call failed: ${response.status} - ${response.statusText}`
                    );
                }
            })
            .catch((error) => {
                console.error(error);
                // put events back in pending if call fails
                this.pendingEvents.push(...events);
            });
    }
}
