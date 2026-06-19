// EMPLOYEE CONTROLLER — only HTTP handling

import {
  createEmployeeService,
  getEmployeesService,
  updateEmployeeService,
  deleteEmployeeService,
} from "../services/employeeService.js";

// CREATE
export const createEmployee = async (req, res, next) => {
  try {
    const employee = await createEmployeeService(req.body);
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await getEmployeesService();
    res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await updateEmployeeService(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteEmployee = async (req, res, next) => {
  try {
    await deleteEmployeeService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};