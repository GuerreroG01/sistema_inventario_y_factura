import sequelize from "../config/database.js";

export const syncSequence = async ( tableName, columnName = "id" ) => {
    try {
        await sequelize.query(`
            SELECT setval(
                pg_get_serial_sequence('"${tableName}"', '${columnName}'),
                COALESCE(
                    (SELECT MAX("${columnName}") FROM "${tableName}"),
                    0
                ),
                true
            );
        `);

    } catch (error) {
        console.error(
            `❌ Error synchronizing sequence for ${tableName}:`,
            error.message
        );
    }
};