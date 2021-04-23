import { IPerformanceTracker, IPerformanceMetrics } from "../definitions";

class PerformanceTracker extends EventTarget implements IPerformanceTracker {
    private readonly startTime = Date.now();
    /**
     * Map of component names to load metrics for that component.
     */
    private readonly eventPerformanceMetricsMap = new Map<
        string,
        Map<string, IPerformanceMetrics>
    >();

    public track(eventName: string, id: string): void {
        const duration = Date.now() - this.startTime;
        const metrics = this.getOrCreatePerformanceMetricsForId(eventName, id);

        metrics.durationsInMs.push(duration);
        metrics.maxDurationInMs = Math.max(metrics.maxDurationInMs, duration);
        metrics.minDurationInMs = Math.max(metrics.minDurationInMs, duration);

        this.dispatchEvent(new Event(eventName));
    }

    public getPerformanceMetricsForEvent(
        eventName: string
    ): Map<string, IPerformanceMetrics> {
        const performanceMetricsForEvent = this.eventPerformanceMetricsMap.get(
            eventName
        );
        if (!performanceMetricsForEvent) {
            return new Map();
        }
        return performanceMetricsForEvent;
    }

    private getOrCreatePerformanceMetricsForId(
        eventName: string,
        id: string
    ): IPerformanceMetrics {
        const performanceMetricsForEvent = this.getOrCreatePerformanceMetricsForEvent(
            eventName
        );
        let performanceMetricsForId = performanceMetricsForEvent.get(id);
        if (!performanceMetricsForId) {
            performanceMetricsForId = {
                durationsInMs: [],
                minDurationInMs: 0,
                maxDurationInMs: 0,
            };
            performanceMetricsForEvent.set(id, performanceMetricsForId);
        }
        return performanceMetricsForId;
    }

    private getOrCreatePerformanceMetricsForEvent(
        eventName: string
    ): Map<string, IPerformanceMetrics> {
        let performanceMetricsForEvent = this.eventPerformanceMetricsMap.get(
            eventName
        );
        if (!performanceMetricsForEvent) {
            performanceMetricsForEvent = new Map<string, IPerformanceMetrics>();
            this.eventPerformanceMetricsMap.set(
                eventName,
                performanceMetricsForEvent
            );
        }
        return performanceMetricsForEvent;
    }
}

export const performanceTracker = new PerformanceTracker();
