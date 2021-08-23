import { useEffect } from "react";
import { IPerformanceTracker, IPerformanceMetrics } from "../definitions";
import { EventEmitter } from "../shared-utils";

class PerformanceTracker extends EventEmitter implements IPerformanceTracker {
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
        metrics.minDurationInMs = Math.min(metrics.minDurationInMs, duration);

        this.emit(eventName);
    }

    public getPerformanceMetricsForEvent(
        eventName: string
    ): Map<string, IPerformanceMetrics> {
        const performanceMetricsForEvent =
            this.eventPerformanceMetricsMap.get(eventName);
        if (!performanceMetricsForEvent) {
            return new Map();
        }
        return performanceMetricsForEvent;
    }

    private getOrCreatePerformanceMetricsForId(
        eventName: string,
        id: string
    ): IPerformanceMetrics {
        const performanceMetricsForEvent =
            this.getOrCreatePerformanceMetricsForEvent(eventName);
        let performanceMetricsForId = performanceMetricsForEvent.get(id);
        if (!performanceMetricsForId) {
            performanceMetricsForId = {
                durationsInMs: [],
                minDurationInMs: Number.MAX_SAFE_INTEGER,
                maxDurationInMs: 0,
            };
            performanceMetricsForEvent.set(id, performanceMetricsForId);
        }
        return performanceMetricsForId;
    }

    private getOrCreatePerformanceMetricsForEvent(
        eventName: string
    ): Map<string, IPerformanceMetrics> {
        let performanceMetricsForEvent =
            this.eventPerformanceMetricsMap.get(eventName);
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

export const useTrackLoad = (componentName: string): void => {
    useEffect(() => {
        performanceTracker.track("component-load", componentName);
    }, []);
};
