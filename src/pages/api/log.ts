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
    if (body instanceof Array) {
        await sessionPerfLogger.logMany(body);
    } else {
        await sessionPerfLogger.log(body);
    }
    res.status(200).send("Logged");
};

export default handler;
