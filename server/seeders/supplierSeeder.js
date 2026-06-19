import Supplier from "../src/models/Supplier.js";

const seedSupplier = async () => {
  await Supplier.bulkCreate(
    [
      { supplierName: "Hamza Traders", contact: "03005556666", company: "Hamza Foods", email: "hamzafoods@gmail.com", address: "Brandreth Road, Lahore", status: "Y" },
      { supplierName: "Al Noor Traders", contact: "03117778888", company: "Al Noor Pvt Ltd", email: "alnoortraders@gmail.com", address: "Gulshan Market, Gujranwala", status: "Y" },
      { supplierName: "Pak Distributors", contact: "03219998888", company: "Pak Foods", email: "pakdistributors@gmail.com", address: "Circular Road, Faisalabad", status: "Y" },
      { supplierName: "City Wholesale", contact: "03335557777", company: "City Mart", email: "citywholesale@gmail.com", address: "Akbari Mandi, Lahore", status: "Y" },
      { supplierName: "Prime Suppliers", contact: "03456667777", company: "Prime Ltd", email: "primesuppliers@gmail.com", address: "GT Road, Gujranwala", status: "Y" },
      { supplierName: "Star Distributors", contact: "03078889999", company: "Star Foods", email: "stardistributors@gmail.com", address: "Samanabad, Lahore", status: "Y" },
      { supplierName: "National Traders", contact: "03168887777", company: "National Pvt Ltd", email: "nationaltraders@gmail.com", address: "Daska Road, Sialkot", status: "Y" },
      { supplierName: "Galaxy Suppliers", contact: "03257776666", company: "Galaxy Enterprises", email: "galaxysuppliers@gmail.com", address: "Railway Road, Gujrat", status: "Y" },
      { supplierName: "United Wholesale", contact: "03347775555", company: "United Mart", email: "unitedwholesale@gmail.com", address: "Jinnah Road, Rawalpindi", status: "Y" },
      { supplierName: "Fast Traders", contact: "03437774444", company: "Fast Distribution", email: "fasttraders@gmail.com", address: "Main Bazar, Sheikhupura", status: "Y" },
    ],
    { ignoreDuplicates: true }
  );

  console.log("Supplier seeder completed");
};

export default seedSupplier;