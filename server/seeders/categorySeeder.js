import Category from "../src/models/Category.js";

const seedCategory = async () => {
  await Category.bulkCreate(
    [
      { categoryName: "Grocery", categoryCode: "GRC", description: "Daily grocery items", status: "Y" },
      { categoryName: "Beverages", categoryCode: "BEV", description: "Drinks and juices", status: "Y" },
      { categoryName: "Dairy", categoryCode: "DAR", description: "Milk and dairy products", status: "Y" },
      { categoryName: "Snacks", categoryCode: "SNK", description: "Chips and snacks", status: "Y" },
      { categoryName: "Bakery", categoryCode: "BAK", description: "Bread and bakery items", status: "Y" },
      { categoryName: "Household", categoryCode: "HHD", description: "Home use products", status: "Y" },
      { categoryName: "Stationery", categoryCode: "STN", description: "Office and school items", status: "Y" },
      { categoryName: "Frozen Foods", categoryCode: "FRZ", description: "Frozen products", status: "Y" },
      { categoryName: "Personal Care", categoryCode: "PCR", description: "Personal care products", status: "Y" },
      { categoryName: "Cleaning", categoryCode: "CLN", description: "Cleaning products", status: "Y" },
    ],
    { ignoreDuplicates: true }
  );

  console.log("Category seeder completed");
};

export default seedCategory;