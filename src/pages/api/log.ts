import { NextApiRequest, NextApiResponse } from "next";
import { SessionPerformanceLogger } from "../../server-utils";

const sessionPerfLogger = new SessionPerformanceLogger();

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const body = req.body;
    if (!body) {
        return res.status(400).send("Empty request body");
    }
    const sessionId = body.sessionId;
    if (!sessionId) {
        return res
            .status(400)
            .send("Missing/Empty sessionId property of request body");
    }
    const logBody = body.log;
    if (!logBody) {
        return res
            .status(400)
            .send("Missing/Empty log property of request body");
    }
    if (logBody instanceof Array) {
        await sessionPerfLogger.logMany(logBody, sessionId);
    } else {
        await sessionPerfLogger.log(logBody, sessionId);
    }
    res.status(200).send("Logged");
};

export default handler;
