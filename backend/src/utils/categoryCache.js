let categoriesCache = null;
let categoriesCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24;

export const invalidateCategoryCache = (newCategory) => {
    if (!newCategory) return;
    if (!categoriesCache) return;

    const exists = categoriesCache.includes(newCategory);

    if (exists) return;

    categoriesCache = null;
    categoriesCacheTime = 0;
};

export const setCategoryCache = (categories) => {
    categoriesCache = categories;
    categoriesCacheTime = Date.now();
};

export const getCategoryCache = () => {
    const now = Date.now();

    if (categoriesCache && now - categoriesCacheTime < CACHE_TTL) {
        return categoriesCache;
    }

    return null;
};

export const clearCategoryCache = () => {
    categoriesCache = null;
    categoriesCacheTime = 0;
};