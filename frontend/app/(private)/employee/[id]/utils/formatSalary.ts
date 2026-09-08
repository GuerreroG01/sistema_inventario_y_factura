export function formatSalary(value: number) {
    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `C$${formatter.format(Number(value))}`;
}