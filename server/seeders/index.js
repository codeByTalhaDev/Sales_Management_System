import sequelize from "../src/config/db.js";

import "../src/models/User.js";
import "../src/models/Customer.js";
import "../src/models/Supplier.js";
import "../src/models/Employee.js";
import "../src/models/UOM.js";
import "../src/models/Category.js";
import "../src/models/Product.js";
import "../src/models/associations.js";

import seedUOM from "./uomSeeder.js";
import seedCategory from "./categorySeeder.js";
import seedCustomer from "./customerSeeder.js";
import seedSupplier from "./supplierSeeder.js";
import seedEmployee from "./employeeSeeder.js";
import seedProduct from "./productSeeder.js";

const runSeeders = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected");

    await seedUOM();
    await seedCategory();
    await seedCustomer();
    await seedSupplier();
    await seedEmployee();
    await seedProduct();

    console.log("All seeders inserted successfully");

    process.exit(0);
  } catch (error) {
    console.log("Seeder error:", error);
    process.exit(1);
  }
};

runSeeders();