import Sales from "../models/Sales.js";

let statusCache = null;
let statusCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24;

export const getSaleStatuses = async () => {
    const now = Date.now();

    if (statusCache && now - statusCacheTime < CACHE_TTL) {
        return statusCache;
    }

    const statuses = await Sales.findAll({
        attributes: ["status"],
        where: {
            status: {
                [Op.ne]: null
            }
        },
        raw: true
    });

    const clean = [...new Set(statuses.map(s => s.status))];

    statusCache = clean;
    statusCacheTime = now;

    return clean;
};

export const clearStatusCache = () => {
    statusCache = null;
    statusCacheTime = 0;
};