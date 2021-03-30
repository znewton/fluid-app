import { NextApiRequest, NextApiResponse } from "next";
import { sessionStorage } from "../../server-utils";

const handler = async (
    _req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const session = await sessionStorage.get();
    if (!session) {
        return res.status(404).send("No active session found.");
    }
    res.status(200).send(session.perfStats);
};

export default handler;
