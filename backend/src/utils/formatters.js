export const normalizeDate = (value) => {
    if (!value || value === "") return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
};