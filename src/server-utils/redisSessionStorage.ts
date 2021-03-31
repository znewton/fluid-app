import { ISession, ISessionStorage } from "../definitions";
import Redis, { Redis as RedisClient } from "ioredis";

export class RedisSessionStorage implements ISessionStorage {
    private readonly redisClient: RedisClient;

    constructor(
        hostUrl: string,
        private readonly onSessionClear?: (session: ISession) => Promise<void>,
        private readonly maxSessionLifetimeInMs = 24 * 60 * 60 * 1000,
        private readonly sessionId = "fluid-app-session"
    ) {
        this.redisClient = new Redis(hostUrl);
    }

    public async get(): Promise<ISession | undefined> {
        const session = await this.redisClient.get(this.sessionId);
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
        if (session.connections <= 0) {
            return this.clear(session);
        }
        const stringifiedSession = JSON.stringify(session);
        await this.redisClient.set(this.sessionId, stringifiedSession);
    }

    public async clear(session?: ISession): Promise<void> {
        const sessionToClear = session || (await this.get());
        if (sessionToClear) {
            sessionToClear.endedAt = Date.now();
            if (this.onSessionClear) {
                await this.onSessionClear(sessionToClear);
            }
        }
        await this.redisClient.del(this.sessionId);
    }
}
