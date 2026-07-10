const KEY_PREFIX = "chithra:";

const memoryStore = new Map();

let redisClient;

function isRedisConfigured() {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
    if (redisClient !== undefined) return redisClient;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
        redisClient = null;
        return redisClient;
    }

    try {
        const { Redis } = require("@upstash/redis");
        redisClient = new Redis({ url, token });
    } catch {
        redisClient = null;
    }

    return redisClient;
}

function redisKey(...parts) {
    return `${KEY_PREFIX}${parts.join(":")}`;
}

function pruneMemoryStore(now = Date.now()) {
    if (memoryStore.size < 5000) return;
    for (const [key, entry] of memoryStore.entries()) {
        if (entry.expiresAt <= now) memoryStore.delete(key);
    }
}

function memoryGet(key) {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        memoryStore.delete(key);
        return null;
    }
    return entry.value;
}

function memorySet(key, value, ttlSeconds) {
    pruneMemoryStore();
    memoryStore.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000
    });
}

async function cacheGetJson(key) {
    const redis = getRedis();
    if (redis) {
        const value = await redis.get(key);
        return value ?? null;
    }

    const raw = memoryGet(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

async function cacheSetJson(key, value, ttlSeconds) {
    const redis = getRedis();
    if (redis) {
        await redis.set(key, value, { ex: ttlSeconds });
        return;
    }
    memorySet(key, JSON.stringify(value), ttlSeconds);
}

async function cacheIncr(key, ttlSeconds) {
    const redis = getRedis();
    if (redis) {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, ttlSeconds);
        }
        return count;
    }

    const raw = memoryGet(key);
    const count = raw ? Number.parseInt(raw, 10) + 1 : 1;
    memorySet(key, String(count), ttlSeconds);
    return count;
}

module.exports = {
    isRedisConfigured,
    redisKey,
    cacheGetJson,
    cacheSetJson,
    cacheIncr
};
