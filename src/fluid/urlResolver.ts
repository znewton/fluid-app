import type { IRequest } from "@fluidframework/core-interfaces";
import type {
    IFluidResolvedUrl,
    IResolvedUrl,
    IUrlResolver,
} from "@fluidframework/driver-definitions";
import { ScopeType } from "@fluidframework/protocol-definitions";
import qs from "querystring";

export class UrlResolver implements IUrlResolver {
    constructor(
        private readonly endpoint: string,
        private readonly documentId: string,
        private readonly userId: string
    ) {}

    public async resolve(request: IRequest): Promise<IResolvedUrl> {
        const queryParams = qs.stringify({
            reqUrl: request.url,
            docId: this.documentId,
            scopes: [
                ScopeType.DocRead,
                ScopeType.DocWrite,
                ScopeType.SummaryWrite,
            ],
            userId: this.userId,
        });
        const resolvedUrl: IFluidResolvedUrl = await fetch(
            `${this.endpoint}?${queryParams}`
        ).then((response) => {
            if (!response.ok) {
                throw new Error("URL Resolution Request Failed");
            }
            return response.json();
        });
        return resolvedUrl;
    }

    public async getAbsoluteUrl(
        resolvedUrl: IFluidResolvedUrl,
        relativeUrl: string
    ): Promise<string> {
        if (resolvedUrl.type !== "fluid") throw Error("Invalid Resolved Url");

        return `${resolvedUrl.url}/${relativeUrl}`;
    }
}
