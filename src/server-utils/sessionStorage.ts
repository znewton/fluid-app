import { redisConfig } from "../config/config";
import { EnvSessionStorage } from "./envSessionStorage";
import { NullSessionStorage } from "./nullSessionStorage";
import { RedisSessionStorage } from "./redisSessionStorage";

export const sessionStorage =
    redisConfig === undefined
        ? new NullSessionStorage()
        : redisConfig === "env"
        ? new EnvSessionStorage()
        : new RedisSessionStorage(redisConfig.host);
