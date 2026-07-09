export function canModifyExpense(expenseDate) {
    const today = new Date();
    const date = new Date(expenseDate);

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
    );
}