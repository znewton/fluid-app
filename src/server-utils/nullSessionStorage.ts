import { ISession, ISessionStorage } from "../definitions";

const blankSession: ISession = {
    id: "null",
    createdAt: Date.now(),
    endedAt: undefined,
    perfStats: {},
};

export class NullSessionStorage implements ISessionStorage {
    public async get(): Promise<ISession> {
        return blankSession;
    }
    public async set(): Promise<void> {
        return;
    }
    public async getOrCreate(): Promise<ISession> {
        return blankSession;
    }
    public async clear(): Promise<void> {
        return;
    }
}
