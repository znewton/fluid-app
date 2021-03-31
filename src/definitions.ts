export interface IPerformanceStats {
    count: number;
    avgDurationInMs: number;
    highestDurationInMs: number;
    lowestDurationInMs: number;
}

export interface ISession {
    id: string;
    connections: number;
    maxConnections: number;
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
    get(): Promise<ISession | undefined>;
    /**
     * Sets current session to provided session.
     */
    set(session: ISession): Promise<void>;
    /**
     * Clears current (or provided) session.
     */
    clear(session?: ISession): Promise<void>;
}

export interface ILogger {
    log(data: unknown): Promise<void>;
    logMany(data: unknown[]): Promise<void>;
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
