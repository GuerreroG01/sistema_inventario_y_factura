'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {

            await queryInterface.createTable(
                "ProductsUnits",
                {
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false,
                    },

                    product_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: "Products",
                            key: "id",
                        },
                        onUpdate: "CASCADE",
                        onDelete: "RESTRICT",
                    },

                    unit: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },

                    barcode: {
                        type: Sequelize.STRING,
                        allowNull: true,
                        unique: true,
                    },

                    price: {
                        type: Sequelize.DECIMAL(10, 2),
                        allowNull: false,
                    },

                    cost: {
                        type: Sequelize.DECIMAL(10, 2),
                        allowNull: true,
                    },

                    stock: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        defaultValue: 0,
                    },

                    hasPromotion: {
                        type: Sequelize.BOOLEAN,
                        allowNull: false,
                        defaultValue: false,
                    },

                    promotionPrice: {
                        type: Sequelize.DECIMAL(10, 2),
                        allowNull: true,
                    },

                    promotionQuantity: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                    },

                    promotionStart: {
                        type: Sequelize.DATE,
                        allowNull: true,
                    },

                    promotionEnd: {
                        type: Sequelize.DATE,
                        allowNull: true,
                    },

                    entryDate: {
                        type: Sequelize.DATEONLY,
                        allowNull: true,
                    },

                    expirationDate: {
                        type: Sequelize.DATEONLY,
                        allowNull: true,
                    },

                    active: {
                        type: Sequelize.BOOLEAN,
                        allowNull: false,
                        defaultValue: true,
                    },
                },
                {
                    transaction,
                }
            );

            await queryInterface.sequelize.query(
                `
                INSERT INTO "ProductsUnits"
                (
                    product_id,
                    unit,
                    barcode,
                    price,
                    cost,
                    stock,
                    "hasPromotion",
                    "promotionPrice",
                    "promotionStart",
                    "promotionEnd",
                    "entryDate",
                    "expirationDate",
                    active
                )
                SELECT
                    id,
                    COALESCE(unit, 'unit'),
                    barcode,
                    price,
                    cost,
                    stock,
                    "hasPromotion",
                    "promotionPrice",
                    "promotionStart",
                    "promotionEnd",
                    "entryDate",
                    "expirationDate",
                    active
                FROM "Products"
                `,
                {
                    transaction,
                }
            );

            await queryInterface.addColumn(
                "SaleDetails",
                "product_unit_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ProductsUnits",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },
                {
                    transaction,
                }
            );

            await queryInterface.sequelize.query(
                `
                UPDATE "SaleDetails" AS sd
                SET "product_unit_id" = pu.id
                FROM "ProductsUnits" AS pu
                WHERE pu."product_id" = sd."product_id"
                `,
                {
                    transaction,
                }
            );

            const [saleDetailOrphans] =
                await queryInterface.sequelize.query(
                    `
                    SELECT COUNT(*)::integer AS count
                    FROM "SaleDetails"
                    WHERE "product_unit_id" IS NULL
                    `,
                    {
                        transaction,
                    }
                );

            if (saleDetailOrphans[0].count > 0) {
                throw new Error(
                    `Hay ${saleDetailOrphans[0].count} SaleDetails sin ProductsUnit asociado.`
                );
            }

            await queryInterface.changeColumn(
                "SaleDetails",
                "product_unit_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                {
                    transaction,
                }
            );

            await queryInterface.addColumn(
                "Inventory_mov",
                "product_unit_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: "ProductsUnits",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "RESTRICT",
                },
                {
                    transaction,
                }
            );

            await queryInterface.sequelize.query(
                `
                UPDATE "Inventory_mov" AS im
                SET "product_unit_id" = pu.id
                FROM "ProductsUnits" AS pu
                WHERE pu."product_id" = im."product_id"
                `,
                {
                    transaction,
                }
            );

            const [inventoryOrphans] =
                await queryInterface.sequelize.query(
                    `
                    SELECT COUNT(*)::integer AS count
                    FROM "Inventory_mov"
                    WHERE "product_unit_id" IS NULL
                    `,
                    {
                        transaction,
                    }
                );

            if (inventoryOrphans[0].count > 0) {
                throw new Error(
                    `Hay ${inventoryOrphans[0].count} movimientos de inventario sin ProductsUnit asociado.`
                );
            }

            await queryInterface.changeColumn(
                "Inventory_mov",
                "product_unit_id",
                {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                {
                    transaction,
                }
            );

            const saleDetailForeignKeys =
                await queryInterface.getForeignKeyReferencesForTable(
                    "SaleDetails"
                );

            const saleDetailProductFK =
                saleDetailForeignKeys.find(
                    (fk) => fk.columnName === "product_id"
                );

            if (saleDetailProductFK) {
                await queryInterface.removeConstraint(
                    "SaleDetails",
                    saleDetailProductFK.constraintName,
                    {
                        transaction,
                    }
                );
            }

            await queryInterface.removeColumn(
                "SaleDetails",
                "product_id",
                {
                    transaction,
                }
            )

            const inventoryForeignKeys =
                await queryInterface.getForeignKeyReferencesForTable(
                    "Inventory_mov"
                );

            const inventoryProductFK =
                inventoryForeignKeys.find(
                    (fk) => fk.columnName === "product_id"
                );

            if (inventoryProductFK) {
                await queryInterface.removeConstraint(
                    "Inventory_mov",
                    inventoryProductFK.constraintName,
                    {
                        transaction,
                    }
                );
            }

            await queryInterface.removeColumn(
                "Inventory_mov",
                "product_id",
                {
                    transaction,
                }
            );

            const productColumnsToRemove = [
                "barcode",
                "unit",
                "price",
                "cost",
                "stock",
                "hasPromotion",
                "promotionPrice",
                "promotionStart",
                "promotionEnd",
                "entryDate",
                "expirationDate",
            ];

            for (const column of productColumnsToRemove) {
                await queryInterface.removeColumn(
                    "Products",
                    column,
                    {
                        transaction,
                    }
                );
            }

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        throw new Error(
            "Esta migración no puede revertirse automáticamente de forma segura porque los datos de Products fueron trasladados a ProductsUnits."
        );
    },
};