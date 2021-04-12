import { ScopeType } from "@fluidframework/protocol-definitions";
import { NextApiRequest, NextApiResponse } from "next";
import { serviceConfig } from "../../config/config";
import { generateToken } from "../../server-utils";

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> => {
    const docId = req.query.docId as string;
    const token = generateToken(docId, [ScopeType.DocRead]);
    const exists = await fetch(
        `${serviceConfig.ordererUrl}/documents/${serviceConfig.tenantId}/${docId}`,
        {
            headers: {
                Authorization: `Basic ${token}`,
            },
        }
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error("Call to check doc failed");
            }
            return response.text();
        })
        .then((result) => result !== "null")
        .catch(() => false);
    res.status(200).send(exists);
};

export default handler;
