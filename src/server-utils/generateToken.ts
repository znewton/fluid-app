import { ScopeType } from "@fluidframework/protocol-definitions";
import { generateToken as fluidGenerateToken } from "@fluidframework/server-services-utils";
import { serviceConfig } from "../config/config";

export const generateToken = (
    documentId: string,
    scopes?: ScopeType[],
    userId?: string
): string =>
    fluidGenerateToken(
        serviceConfig.tenantId,
        documentId,
        serviceConfig.tenantSecret,
        scopes || [],
        userId ? { id: userId } : undefined,
        60 * 60 // lifetime in seconds
    );
