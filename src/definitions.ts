export interface IPerformanceStats {
    count: number;
    avgDurationInMs: number;
    highestDurationInMs: number;
    lowestDurationInMs: number;
}

export interface ISession {
    id: string;
    createdAt: number;
    endedAt: number | undefined;
    perfStats: { [eventName: string]: IPerformanceStats };
}

export interface ISessionResponse extends ISession {
    new: boolean;
}

export interface ISessionStorage {
    /**
     * Retrieves current session. Returns undefined if no current session.
     */
    get(id: string): Promise<ISession | undefined>;
    /**
     * Sets current session to provided session.
     */
    set(session: ISession): Promise<void>;
    /**
     * Clears current (or provided) session.
     */
    clear(session?: ISession): Promise<void>;
    /**
     * Gets an existing session, or creates a new one if it doesn't exist.
     */
    getOrCreate(id: string): Promise<ISession>;
}

export interface ILogger {
    log(data: unknown, ...args: any[]): Promise<void>;
    logMany(data: unknown[], ...args: any[]): Promise<void>;
}

/**
 * (Possibly) External Service Config Definitions
 */

export interface IFluidServiceConfig {
    tenantId: string;
    tenantSecret: string;
    ordererUrl: string;
    storageUrl: string;
}

export interface IRedisConfig {
    host: string;
}

export interface IPerformanceMetrics {
    durationsInMs: number[];
    minDurationInMs: number;
    maxDurationInMs: number;
}

export interface IPerformanceTracker extends EventTarget {
    getPerformanceMetricsForEvent(
        eventName: string
    ): Map<string, IPerformanceMetrics>;
    track(eventName: string, ...args): void;
}
