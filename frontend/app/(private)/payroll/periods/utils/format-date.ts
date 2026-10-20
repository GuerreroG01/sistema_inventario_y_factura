export function formatDate(date: string | null): string {
    if (!date) return "Sin fecha";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
    }

    return parsedDate.toLocaleDateString("es-NI", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}