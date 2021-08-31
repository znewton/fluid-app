import { NextApiRequest, NextApiResponse } from "next";
import { ScopeType } from "@fluidframework/protocol-definitions";
import { serviceConfig } from "../../config/config";
import { generateToken } from "../../server-utils";

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
    const tenantId = req.query.tenantId as string;
    const documentId = req.query.documentId as string;
    const scopes = req.query.scopes as ScopeType[];
    const userId = req.query.userId as string;
    if (!tenantId) {
        return res.status(400).send("Missing tenantId in query params");
    }
    if (tenantId !== serviceConfig.tenantId) {
        return res.status(403).send("Invalid tenantId");
    }
    const token = generateToken(documentId, scopes, userId);
    res.status(200).send(token);
};

export default handler;
