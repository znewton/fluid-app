import { ITelemetryPerformanceEvent } from "@fluidframework/common-definitions";
import { ILogger, IPerformanceStats, ISession } from "../definitions";
import { sessionStorage } from "./sessionStorage";

export class SessionPerformanceLogger implements ILogger {
    public async log(data: unknown): Promise<void> {
        const session = await sessionStorage.get();
        if (!session) {
            console.warn("No session to log to. Data loss occurring");
            return;
        }
        this.addEventToSessionPerfStats(session, data);
        await sessionStorage.set(session);
    }

    public async logMany(data: unknown[]): Promise<void> {
        const session = await sessionStorage.get();
        if (!session) {
            console.warn("No session to log to. Data loss occurring");
            return;
        }
        data.forEach((dataItem) => {
            this.addEventToSessionPerfStats(session, dataItem);
        });
        await sessionStorage.set(session);
    }

    private addEventToSessionPerfStats(session: ISession, event: unknown) {
        if (
            typeof event !== "object" ||
            !event ||
            (event as any).category !== "performance"
        ) {
            return;
        }
        const performanceEvent = event as ITelemetryPerformanceEvent;
        if (performanceEvent.duration === undefined) {
            // Skip, likely a "start" event
            return;
        }
        // Update session perf stats
        const eventPerfStats: IPerformanceStats =
            session.perfStats[performanceEvent.eventName];
        if (!eventPerfStats) {
            // create new event perf stats with 1 event
            session.perfStats[performanceEvent.eventName] = {
                count: 1,
                avgDurationInMs: performanceEvent.duration,
                highestDurationInMs: performanceEvent.duration,
                lowestDurationInMs: performanceEvent.duration,
            };
        } else {
            session.perfStats[performanceEvent.eventName] = {
                count: eventPerfStats.count + 1,
                avgDurationInMs:
                    (eventPerfStats.avgDurationInMs +
                        performanceEvent.duration) /
                    2,
                highestDurationInMs: Math.max(
                    performanceEvent.duration,
                    eventPerfStats.highestDurationInMs
                ),
                lowestDurationInMs: Math.min(
                    performanceEvent.duration,
                    eventPerfStats.lowestDurationInMs
                ),
            };
        }
    }
}
