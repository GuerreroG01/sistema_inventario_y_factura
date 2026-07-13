'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const existingBusiness = await queryInterface.sequelize.query(
      `SELECT id FROM "Business" WHERE id = 1`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingBusiness.length === 0) {
      await queryInterface.bulkInsert("Business", [
        {
          id: 1,
          name: "LocalNet Systems",
          status: "ACTIVE",
          createdAt: new Date(),
        }
      ]);

      console.log("Empresa predeterminada creada");
    } else {
      console.log("La empresa predeterminada ya existe");
    }

    const existingUser = await queryInterface.sequelize.query(
      `SELECT "Id" FROM "User" WHERE "Usuario" = 'admin'`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length === 0) {

      await queryInterface.bulkInsert("User", [
        {
          Id: 7,
          Usuario: "admin",
          Clave: "$2b$10$55F/2RvyyirIxc5RbJ234uhIYV6UipUZJLTX6fO70qYrvQrrxrTYC",
          Email: "guerrerog675@gmail.com",
          Telefono: "123123123",
          Rol: "superAdmin",
          FechaIngreso: new Date("2026-07-08T16:13:32.127-06:00"),
          Activo: true,
          UltimoAcceso: new Date("2026-07-13T16:48:15.25-06:00"),
          business_id: 1
        }
      ]);

      console.log("Usuario administrador predeterminado creado");

    } else {
      console.log("El usuario admin ya existe");
    }

  },


  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete(
      "User",
      {
        Usuario: "admin"
      }
    );

    await queryInterface.bulkDelete(
      "Business",
      {
        id: 1
      }
    );

  }
};