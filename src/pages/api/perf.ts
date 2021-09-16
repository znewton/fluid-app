import { NextApiRequest, NextApiResponse } from "next";
import { sessionStorage } from "../../server-utils";

const handleGet = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const sessionId = req.query.id as string;
    const session = await sessionStorage.get(sessionId);
    if (!session) {
        return res.status(404).send(`No session found for id: ${sessionId}`);
    }
    res.status(200).send(session.perfStats);
};

const handleDelete = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const sessionId = req.query.id as string;
    const session = await sessionStorage.get(sessionId);
    if (!session) {
        return res.status(404).send(`No session found for id: ${sessionId}`);
    }
    await sessionStorage.clear(session);
    res.status(200).send("Cleared");
};

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    if (req.method?.toLowerCase() === "get") {
        handleGet(req, res);
    } else if (req.method?.toLowerCase() === "delete") {
        handleDelete(req, res);
    } else {
        res.status(404).send("Request method not found");
    }
};

export default handler;
