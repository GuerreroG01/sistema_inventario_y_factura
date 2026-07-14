const categoriesCache = Object.create(null);
const CACHE_TTL = 1000 * 60 * 60 * 24;


export const invalidateCategoryCache = (business_id, newCategory) => {

    if (!business_id || !newCategory) return;

    const cache = categoriesCache[business_id];

    if (!cache) return;

    const exists = cache.data.includes(newCategory);

    if (exists) return;

    delete categoriesCache[business_id];
};


export const setCategoryCache = (business_id, categories) => {

    categoriesCache[business_id] = {
        data: categories,
        time: Date.now()
    };

};


export const getCategoryCache = (business_id) => {
    const cache = categoriesCache[business_id];

    if (!cache) {
        return null;
    }

    const now = Date.now();
    if (now - cache.time < CACHE_TTL) {
        return cache.data;
    }

    delete categoriesCache[business_id];
    return null;
};

export const clearCategoryCache = (business_id) => {

    if (business_id) {
        delete categoriesCache[business_id];
        return;
    }

    Object.keys(categoriesCache).forEach(key => {
        delete categoriesCache[key];
    });

};