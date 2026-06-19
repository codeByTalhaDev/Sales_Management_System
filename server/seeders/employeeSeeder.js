import Employee from "../src/models/Employee.js";

const seedEmployee = async () => {
  await Employee.bulkCreate(
    [
      { employeeName: "Abdullah", contact: "03001112222", email: "abdullah@gmail.com", designation: "Manager", salary: 70000, joiningDate: "2025-01-10", status: "Y" },
      { employeeName: "Salman", contact: "03112223333", email: "salman@gmail.com", designation: "Cashier", salary: 45000, joiningDate: "2025-02-15", status: "Y" },
      { employeeName: "Asad", contact: "03213334444", email: "asad@gmail.com", designation: "Salesman", salary: 40000, joiningDate: "2025-03-01", status: "Y" },
      { employeeName: "Rizwan", contact: "03314445555", email: "rizwan@gmail.com", designation: "Store Keeper", salary: 42000, joiningDate: "2025-03-20", status: "Y" },
      { employeeName: "Imran", contact: "03415556666", email: "imran@gmail.com", designation: "Accountant", salary: 60000, joiningDate: "2025-04-05", status: "Y" },
      { employeeName: "Danish", contact: "03026667777", email: "danish@gmail.com", designation: "Inventory Officer", salary: 50000, joiningDate: "2025-05-12", status: "Y" },
      { employeeName: "Adeel", contact: "03127778888", email: "adeel@gmail.com", designation: "Purchase Officer", salary: 52000, joiningDate: "2025-06-18", status: "Y" },
      { employeeName: "Noman", contact: "03228889999", email: "noman@gmail.com", designation: "Sales Executive", salary: 43000, joiningDate: "2025-07-22", status: "Y" },
      { employeeName: "Waqas", contact: "03329990000", email: "waqas@gmail.com", designation: "Data Entry Operator", salary: 35000, joiningDate: "2025-08-01", status: "Y" },
      { employeeName: "Kashif", contact: "03430001111", email: "kashif@gmail.com", designation: "Supervisor", salary: 55000, joiningDate: "2025-09-10", status: "Y" },
    ],
    { ignoreDuplicates: true }
  );

  console.log("Employee seeder completed");
};

export default seedEmployee;