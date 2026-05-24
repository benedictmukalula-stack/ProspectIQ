export function formatDate(input) {
    if (!input)
        return "—";
    const date = new Date(input);
    if (isNaN(date.getTime()))
        return "—";
    return date.toLocaleString("en-ZM", {
        timeZone: "Africa/Lusaka",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
