import { NextApiRequest, NextApiResponse } from "next";
import { sessionStorage } from "../../server-utils";

const handler = async (
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

export default handler;
