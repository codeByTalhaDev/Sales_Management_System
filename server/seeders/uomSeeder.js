import UOM from "../src/models/UOM.js";

const seedUOM = async () => {
  await UOM.bulkCreate(
    [
      { uomName: "Kilogram", shortCode: "KG", description: "Weight in kilograms", status: "Y" },
      { uomName: "Gram", shortCode: "GM", description: "Weight in grams", status: "Y" },
      { uomName: "Liter", shortCode: "LTR", description: "Liquid volume", status: "Y" },
      { uomName: "Milliliter", shortCode: "ML", description: "Small liquid volume", status: "Y" },
      { uomName: "Piece", shortCode: "PCS", description: "Single item", status: "Y" },
      { uomName: "Box", shortCode: "BOX", description: "Box packing", status: "Y" },
      { uomName: "Packet", shortCode: "PKT", description: "Packet packing", status: "Y" },
      { uomName: "Dozen", shortCode: "DZN", description: "12 pieces", status: "Y" },
      { uomName: "Carton", shortCode: "CTN", description: "Carton packing", status: "Y" },
      { uomName: "Meter", shortCode: "MTR", description: "Length measurement", status: "Y" },
    ],
    { ignoreDuplicates: true }
  );

  console.log("UOM seeder completed");
};

export default seedUOM;