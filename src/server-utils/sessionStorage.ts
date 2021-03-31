import { redisConfig } from "../config/config";
import { EnvSessionStorage } from "./envSessionStorage";
import { RedisSessionStorage } from "./redisSessionStorage";

export const sessionStorage =
    redisConfig === undefined
        ? new EnvSessionStorage()
        : new RedisSessionStorage(redisConfig.host);
