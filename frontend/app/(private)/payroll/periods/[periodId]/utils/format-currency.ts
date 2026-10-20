const currencyFormatter = new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
});

export function formatCurrency(value: number | string) {
    return currencyFormatter.format(Number(value) || 0);
}