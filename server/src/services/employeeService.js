// EMPLOYEE SERVICE — all business logic & DB queries

import Employee from "../models/Employee.js";

// CREATE
export const createEmployeeService = async (data) => {
  const {
    employeeName,
    contact,
    email,
    designation,
    salary,
    joiningDate,
  } = data;

  const employee = await Employee.create({
    employeeName,
    contact,
    email,
    designation,
    salary,
    joiningDate,
    status: "Y",
  });

  return employee;
};

// GET ALL ACTIVE
export const getEmployeesService = async () => {
  const employees = await Employee.findAll({
    where: { status: "Y" },
    order: [["createdAt", "DESC"]],
  });

  return employees;
};

// UPDATE
export const updateEmployeeService = async (id, data) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  await employee.update({
    employeeName: data.employeeName,
    contact: data.contact,
    email: data.email,
    designation: data.designation,
    salary: data.salary,
    joiningDate: data.joiningDate,
  });

  return employee;
};

// SOFT DELETE
export const deleteEmployeeService = async (id) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  await employee.update({ status: "N" });
};