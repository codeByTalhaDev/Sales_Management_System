import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/db.js";

// IMPORT MODELS
import "./models/User.js";
import "./models/Customer.js";
import "./models/Employee.js";
import "./models/Supplier.js";
import "./models/UOM.js";
import "./models/Category.js";
import "./models/Product.js";
import "./models/Purchase.js";
import "./models/PurchaseItem.js";
import "./models/associations.js";

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL Connected");
    // alter: true lets Sequelize add/adjust columns on existing tables
    // (e.g. new offlineId/version columns on Customer) without a
    // separate migration system. Fine for development; swap for real
    // migrations before this runs against production data.
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database Connection Error:", error);
  });