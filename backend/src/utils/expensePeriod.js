export function canModifyExpense(expenseDate) {
    const today = new Date();
    const [year, month] = expenseDate
        .slice(0, 10)
        .split("-")
        .map(Number);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const sameYear = year === currentYear;
    const sameMonth = month === currentMonth;

    return sameYear && sameMonth;
}