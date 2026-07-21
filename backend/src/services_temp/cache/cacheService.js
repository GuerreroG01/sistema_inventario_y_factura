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

    buildKey(key, businessId) {
        if (!businessId) {
            return key;
        }

        return `${key}:${businessId}`;
    }

    get(key, businessId) {
        return cache.get(this.buildKey(key, businessId));
    }

    set(key, value, ttl = CacheTTL.FIVE_MINUTES, businessId) {
        cache.set(this.buildKey(key, businessId), value, ttl);
    }

    del(key, businessId) {
        return cache.del(this.buildKey(key, businessId));
    }

    has(key, businessId) {
        return cache.has(this.buildKey(key, businessId));
    }

    clear() {
        cache.flushAll();
    }

    delByPrefix(prefix, businessId) {
        const fullPrefix = this.buildKey(prefix, businessId);

        const keys = cache.keys();

        const matchedKeys = keys.filter((key) =>
            key.startsWith(fullPrefix)
        );

        return cache.del(matchedKeys);
    }
    delOtherByPrefix(prefix, businessId) {

        const keys = cache.keys();

        const matchedKeys = keys.filter((key) =>
            key.includes(`${prefix}`) &&
            key.endsWith(`:${businessId}`)
        );

        return cache.del(matchedKeys);
    }

    async remember(key, callback, ttl = CacheTTL.FIVE_MINUTES, businessId) {
        const cacheKey = this.buildKey(key, businessId);

        const cached = this.get(key, businessId);

        if (cached !== undefined) {
            console.log(`[CACHE] HIT -> ${cacheKey}`);
            return cached;
        }

        console.log(`[CACHE] MISS -> ${cacheKey}`);

        const value = await callback();

        if (value !== undefined && value !== null) {
            this.set(key, value, ttl, businessId);
        }

        return value;
    }
}

export const cacheService = new CacheService();