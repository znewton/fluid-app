import { FunctionComponent, useEffect, useState } from "react";
import { performanceTracker } from "../client-utils";
import { Table } from "./Table";

interface IEventPerformanceViewerProps {
    /**
     * Perf view will be updated when this event is fired from performanceTracker.
     */
    eventName: string;
}

export const EventPerformanceViewer: FunctionComponent<IEventPerformanceViewerProps> =
    ({ eventName }) => {
        const [performanceMetrics, setPerformanceMetrics] = useState<
            Record<
                string,
                {
                    id: string;
                    minDurationInMs: number;
                    maxDurationInMs: number;
                }
            >
        >();
        useEffect(() => {
            const listener = () => {
                const metrics =
                    performanceTracker.getPerformanceMetricsForEvent(eventName);
                const perfMetrics = Object.fromEntries(
                    Array.from(metrics.entries()).map(([id, metric]) => [
                        id,
                        {
                            id,
                            minDurationInMs: metric.minDurationInMs,
                            maxDurationInMs: metric.maxDurationInMs,
                        },
                    ])
                );
                setPerformanceMetrics(perfMetrics);
            };
            performanceTracker.on(eventName, listener);
            return () => {
                performanceTracker.off(eventName, listener);
            };
        }, []);
        return <Table data={performanceMetrics ?? {}} />;
    };
