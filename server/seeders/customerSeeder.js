import Customer from "../src/models/Customer.js";

const seedCustomer = async () => {
  await Customer.bulkCreate(
    [
      { customerName: "Ali Raza", contact: "03001234567", cnic: "35202-1234567-1", email: "ali@gmail.com", address: "Model Town, Lahore", status: "Y" },
      { customerName: "Ahmed Khan", contact: "03111234567", cnic: "35202-7654321-2", email: "ahmed@gmail.com", address: "Satellite Town, Gujranwala", status: "Y" },
      { customerName: "Hassan Ali", contact: "03211234567", cnic: "35202-9876543-3", email: "hassan@gmail.com", address: "Peoples Colony, Faisalabad", status: "Y" },
      { customerName: "Bilal Ahmad", contact: "03331234567", cnic: "35202-6543210-4", email: "bilal@gmail.com", address: "DHA Phase 6, Lahore", status: "Y" },
      { customerName: "Usman Malik", contact: "03451234567", cnic: "35202-1111222-5", email: "usman@gmail.com", address: "Civil Lines, Gujranwala", status: "Y" },
      { customerName: "Saad Iqbal", contact: "03015556677", cnic: "35202-3333444-6", email: "saad@gmail.com", address: "Wapda Town, Lahore", status: "Y" },
      { customerName: "Umar Farooq", contact: "03145556677", cnic: "35202-5555666-7", email: "umar@gmail.com", address: "Canal View, Gujranwala", status: "Y" },
      { customerName: "Talal Khan", contact: "03275556677", cnic: "35202-7777888-8", email: "talal@gmail.com", address: "Johar Town, Lahore", status: "Y" },
      { customerName: "Hamza Sheikh", contact: "03365558899", cnic: "35202-8888999-9", email: "hamza@gmail.com", address: "Gulberg III, Lahore", status: "Y" },
      { customerName: "Fahad Butt", contact: "03475559900", cnic: "35202-9999000-0", email: "fahad@gmail.com", address: "Eden Gardens, Faisalabad", status: "Y" },
    ],
    { ignoreDuplicates: true }
  );

  console.log("Customer seeder completed");
};

export default seedCustomer;