import { ISession, ISessionStorage } from "../definitions";

// In development, api gets recompiled every time, effectively resetting info on each request.
// Storing session in process.env prevents this.
// TODO: Would be more scalable to store in redis or something external.
export class EnvSessionStorage implements ISessionStorage {
    private session: ISession | undefined;

    constructor(
        private readonly onSessionClear?: (session: ISession) => Promise<void>,
        private readonly maxSessionLifetimeInMs = 24 * 60 * 60 * 1000
    ) {}

    public async get(): Promise<ISession | undefined> {
        // Try to retrieve session from process.env
        if (!this.session) {
            const envSession = process.env.SESSION;
            if (!envSession || envSession === "undefined") return undefined;
            const parsedSession = JSON.parse(envSession) as ISession;
            this.session = parsedSession;
        }
        // Validate session expiration and clear if expired
        if (
            Date.now() - this.session.createdAt >=
            this.maxSessionLifetimeInMs
        ) {
            this.clear(this.session);
        }
        return this.session;
    }

    public async set(session: ISession): Promise<void> {
        process.env.SESSION = JSON.stringify(session);
        this.session = session;
    }

    public async clear(session?: ISession): Promise<void> {
        const sessionToClear = session || this.session || (await this.get());
        if (sessionToClear) {
            sessionToClear.endedAt = Date.now();
            if (this.onSessionClear) {
                await this.onSessionClear(sessionToClear);
            }
        }
        this.session = undefined;
        delete process.env.SESSION;
    }

    public async getOrCreate(): Promise<ISession> {
        const existingSession = await this.get();
        if (existingSession) {
            return existingSession;
        }

        const newSession = {
            id: "env",
            createdAt: Date.now(),
            endedAt: undefined,
            perfStats: {},
        };
        this.set(newSession);
        return newSession;
    }
}
