import { ISession, ISessionStorage } from "../definitions";
import Redis, { Redis as RedisClient } from "ioredis";

export class RedisSessionStorage implements ISessionStorage {
    private readonly redisClient: RedisClient;

    constructor(
        hostUrl: string,
        private readonly onSessionClear?: (session: ISession) => Promise<void>,
        private readonly maxSessionLifetimeInMs = 24 * 60 * 60 * 1000 * 1000 // 1000 days
    ) {
        this.redisClient = new Redis(hostUrl);
    }

    public async get(sessionId: string): Promise<ISession | undefined> {
        const session = await this.redisClient.get(sessionId);
        // Try to retrieve session from process.env
        if (!session) {
            return undefined;
        }
        const parsedSession = JSON.parse(session) as ISession;

        // Validate session expiration and clear if expired
        if (
            Date.now() - parsedSession.createdAt >=
            this.maxSessionLifetimeInMs
        ) {
            this.clear(parsedSession);
        }
        return parsedSession;
    }

    public async set(session: ISession): Promise<void> {
        const stringifiedSession = JSON.stringify(session);
        await this.redisClient.set(session.id, stringifiedSession);
    }

    public async clear(session: ISession): Promise<void> {
        session.endedAt = Date.now();
        if (this.onSessionClear) {
            await this.onSessionClear(session);
        }
        await this.redisClient.del(session.id);
    }

    public async getOrCreate(sessionId: string): Promise<ISession> {
        const existingSession = await this.get(sessionId);
        if (existingSession) {
            return existingSession;
        }

        const newSession = {
            id: sessionId,
            createdAt: Date.now(),
            endedAt: undefined,
            perfStats: {},
        };
        this.set(newSession);
        return newSession;
    }
}
