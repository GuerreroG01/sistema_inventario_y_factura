import NodeCache from "node-cache";

export const CacheTTL = {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 60 * 5,
    TEN_MINUTES: 60 * 10,
    THIRTY_MINUTES: 60 * 30,
    ONE_HOUR: 60 * 60,
    SIX_HOURS: 60 * 60 * 6,
    ONE_DAY: 60 * 60 * 24,
};

const cache = new NodeCache({
    stdTTL: CacheTTL.FIVE_MINUTES,
    checkperiod: 60,
});

class CacheService {
    get(key) {
        const value = cache.get(key);
        return value;
    }

    set(key, value, ttl = CacheTTL.FIVE_MINUTES) {
        cache.set(key, value, ttl);
    }

    del(key) {
        const deleted = cache.del(key);
        return deleted;
    }

    has(key) {
        const exists = cache.has(key);
        return exists;
    }

    clear() {
        cache.flushAll();
    }

    delByPrefix(prefix) {
        const keys = cache.keys();

        const matchedKeys = keys.filter((key) => key.startsWith(prefix));

        return cache.del(matchedKeys);
    }

    async remember(key, callback, ttl = CacheTTL.FIVE_MINUTES) {
        const cached = this.get(key);

        if (cached !== undefined) {
            console.log(`[CACHE] HIT -> ${key}`);
            return cached;
        }
        console.log(`[CACHE] MISS -> ${key}`);
        const value = await callback();

        if (value !== undefined && value !== null) {
            this.set(key, value, ttl);
        }
        return value;
    }
}

export const cacheService = new CacheService();