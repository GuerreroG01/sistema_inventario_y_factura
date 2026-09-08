export function formatDate(date?: string | null) {
    if (!date) {
        return "No registrada";
    }

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (dateOnlyMatch) {
        const [, year, month, day] = dateOnlyMatch;

        const parsedDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return parsedDate.toLocaleDateString("es-NI", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("es-NI", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
