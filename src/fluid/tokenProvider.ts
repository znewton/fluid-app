import {
    ITokenProvider,
    ITokenResponse,
} from "@fluidframework/routerlicious-driver";
import { ScopeType } from "@fluidframework/protocol-definitions";
import qs from "querystring";

export class TokenProvider implements ITokenProvider {
    private readonly tokenCacheMap: Map<string, string> = new Map();

    constructor(
        private readonly endpoint: string,
        private readonly userId: string
    ) {}

    public async fetchOrdererToken(
        tenantId: string,
        documentId: string,
        refresh = false
    ): Promise<ITokenResponse> {
        return this.fetchToken("orderer", tenantId, documentId, refresh);
    }

    public async fetchStorageToken(
        tenantId: string,
        documentId: string,
        refresh = false
    ): Promise<ITokenResponse> {
        return this.fetchToken("storage", tenantId, documentId, refresh);
    }

    private async fetchToken(
        type: "orderer" | "storage",
        tenantId: string,
        documentId: string,
        refresh: boolean
    ): Promise<ITokenResponse> {
        const cacheKey = this.getTokenCacheKey(type, tenantId, documentId);
        const cachedToken = this.tokenCacheMap.get(cacheKey);
        let fromCache = true;
        let jwt: string;
        if (refresh || cachedToken === undefined) {
            jwt = await this.getSignedToken(tenantId, documentId);
            fromCache = false;
        } else {
            jwt = cachedToken;
        }
        return {
            fromCache,
            jwt,
        };
    }

    private getTokenCacheKey(
        type: "orderer" | "storage",
        tenantId: string,
        documentId: string
    ): string {
        return `${type}:${tenantId}:${documentId}`;
    }

    private async getSignedToken(
        tenantId: string,
        documentId: string
    ): Promise<string> {
        const params = qs.encode({
            tenantId,
            documentId,
            scopes: [
                ScopeType.DocRead,
                ScopeType.DocWrite,
                ScopeType.SummaryWrite,
            ],
            userId: this.userId,
        });
        return fetch(`${this.endpoint}?${params}`, {
            method: "GET",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Token call failed");
                }
                return response.text();
            })
            .catch((err) => {
                console.error("Failed to retrieve token", err);
                throw err;
            });
    }
}
