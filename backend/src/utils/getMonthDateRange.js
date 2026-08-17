export const getMonthDateRange = (month, year) => {
    const startDate = new Date(
        year,
        month - 1,
        1,
        0,
        0,
        0,
        0
    );

    const endDate = new Date(
        year,
        month,
        1,
        0,
        0,
        0,
        0
    );

    return {
        startDate,
        endDate,
    };
};