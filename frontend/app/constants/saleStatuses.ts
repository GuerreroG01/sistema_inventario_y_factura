export const statusOptions = [
    {
        value: "PENDING",
        label: "Pendiente",
        description: "Venta creada pero aún no procesada o pagada.",
    },
    {
        value: "PAID",
        label: "Pagada",
        description: "El pago fue recibido correctamente.",
    },
    {
        value: "COMPLETED",
        label: "Completada",
        description: "La venta fue entregada/finalizada con éxito.",
    },
    {
        value: "CANCELLED",
        label: "Cancelada",
        description: "La venta fue cancelada antes de completarse.",
    },
    {
        value: "REFUNDED",
        label: "Devolución",
        description: "Se devolvió el dinero al cliente.",
    }
];

export const statusLabels = {
    PENDING: "Pendiente",
    PAID: "Pagada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    REFUNDED: "Devolución",
};