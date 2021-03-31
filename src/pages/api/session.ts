import { NextApiRequest, NextApiResponse } from "next";
import sillyname from "sillyname";
import { ISession, ISessionResponse } from "../../definitions";
import { sessionStorage } from "../../server-utils";

const createNewSession = (): ISession => ({
    id: (sillyname() as string).split(" ").join("").toLowerCase(),
    connections: 0,
    maxConnections: 0,
    createdAt: Date.now(),
    endedAt: undefined,
    perfStats: {},
});

const getOrCreateSession = async (): Promise<ISessionResponse> => {
    const session = await sessionStorage.get();
    if (session) {
        return { ...session, new: false };
    }
    const newSession = createNewSession();
    await sessionStorage.set(newSession);
    return { ...newSession, new: true };
};

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const action = req.query.action as string;
    const forceNew = (req.query.forceNew as string) === "true";
    if (forceNew) {
        await sessionStorage.clear();
    }
    if (action === "open") {
        const session = await getOrCreateSession();
        session.connections++;
        if (session.connections > session.maxConnections) {
            session.maxConnections = session.connections;
        }
        await sessionStorage.set(session);
        return res.status(200).send(session);
    }
    if (action === "close") {
        const session = await sessionStorage.get();
        if (!session) {
            return res.status(400).send("Cannot close non-existent connection");
        }
        session.connections--;
        sessionStorage.set(session);
        return res.status(200).send({ ...session, new: false });
    }
    return res.status(400).send('Action must be either "open" or "close"');
};

export default handler;
