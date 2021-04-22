import { IFluidResolvedUrl } from "@fluidframework/driver-definitions";
import { ScopeType } from "@fluidframework/protocol-definitions";
import { NextApiRequest, NextApiResponse } from "next";
import { serviceConfig } from "../../config/config";
import { generateToken } from "../../server-utils";

const handler = (req: NextApiRequest, res: NextApiResponse): void => {
    const queryReqUrl = req.query.reqUrl as string;
    const queryDocId = req.query.docId as string;
    const queryScopes = req.query.scopes as ScopeType[];
    const queryUserId = req.query.userId as string;
    if (!queryReqUrl || typeof queryReqUrl !== "string") {
        return res.status(400).send("Missing reqUrl in query params");
    }
    if (!queryDocId || typeof queryDocId !== "string") {
        return res.status(400).send("Missing docId in query params");
    }
    let requestedUrl = queryReqUrl;
    if (!requestedUrl.includes("://")) {
        if (requestedUrl.startsWith("/")) {
            requestedUrl = `http://dummy:3000${queryReqUrl}`;
        } else {
            requestedUrl = `http://dummy:3000/${queryReqUrl}`;
        }
    }
    const reqUrl = new URL(requestedUrl);

    const token = generateToken(queryDocId, queryScopes, queryUserId);

    const fluidUrl = `fluid://${serviceConfig.ordererUrl.replace(
        /https?:\/\//,
        ""
    )}/${encodeURIComponent(serviceConfig.tenantId)}/${encodeURIComponent(
        queryDocId
    )}${reqUrl.search ?? ""}`;

    const deltaStorageUrl = `${
        serviceConfig.ordererUrl
    }/deltas/${encodeURIComponent(serviceConfig.tenantId)}/${encodeURIComponent(
        queryDocId
    )}`;
    const storageUrl = `${serviceConfig.storageUrl}/repos/${serviceConfig.tenantId}`;
    const ordererUrl = serviceConfig.ordererUrl;

    const resolvedUrl: IFluidResolvedUrl = {
        endpoints: {
            deltaStorageUrl,
            ordererUrl,
            storageUrl,
        },
        id: queryDocId,
        tokens: { jwt: token },
        type: "fluid",
        url: fluidUrl,
    };
    res.status(200).send(resolvedUrl);
};

export default handler;
