import { IFluidServiceConfig, IRedisConfig } from "../definitions";

const serviceConfigs: { [key: string]: IFluidServiceConfig } = {
    local: {
        tenantId: "fluid",
        tenantSecret: "create-new-tenants-if-going-to-production",
        ordererUrl: "http://localhost:3003",
        storageUrl: "http://localhost:3001",
    },
};

export const serviceConfig = serviceConfigs.local;

const redisConfigs: { [key: string]: IRedisConfig | undefined } = {
    local: {
        host: "127.0.0.1:6379",
    },
    none: undefined,
};

export const redisConfig = redisConfigs.local;
