import { useState } from "react";
import { Pencil, Trash2, X, Eye } from "lucide-react";
import * as employeeRepository from "../../offline/modules/people/employee/repository";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import toast from "react-hot-toast";

const emptyEmployee = {
  employeeName: "",
  contact: "",
  email: "",
  designation: "",
  salary: "",
  joiningDate: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

/**
 * A small styled hover tooltip — matches the one used in
 * CustomerTable.jsx / SupplierTable.jsx, replacing the browser's
 * native title bubble.
 */
const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 w-max max-w-[220px] pointer-events-none">
          <span className="block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-snug">
            {text}
          </span>
          <span className="block w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </span>
      )}
    </span>
  );
};

/**
 * Shows the live sync state of an employee record:
 * - yellow "Pending" — saved locally, offline, nothing can happen yet
 * - blue "Syncing..." — saved locally, browser is online, a sync
 *   attempt is imminent or already in progress
 * - green "Synced" — confirmed saved on the server
 * - red "Failed" — the server rejected it; hover to see why
 * Comes from Employees.jsx, which correlates each employee with its
 * queue entry to compute syncState/syncError.
 */
const SyncBadge = ({ status, error, isOnline }) => {
  if (status === "FAILED") {
    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );

    return error ? <Tooltip text={error}>{badge}</Tooltip> : badge;
  }

  if (status === "PENDING" || status === "PROCESSING") {
    if (isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Syncing...
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Synced
    </span>
  );
};

const EmployeeTable = ({
  employees,
  loading,
  fetchEmployees,
  showAddModal,
  setShowAddModal,
}) => {
  const [newEmployee, setNewEmployee] = useState(emptyEmployee);
  const [editEmployee, setEditEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const isOnline = useOnlineStatus();

  const rowsPerPage = 10;

  const activeEmployees = employees.filter((employee) => !employee.isDeleted);

  const totalPages = Math.ceil(activeEmployees.length / rowsPerPage);

  const paginatedEmployees = [...activeEmployees]
    .sort((a, b) => b.localId - a.localId)
    .slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleNewChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditEmployee({
      ...editEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveNew = async () => {
    if (!newEmployee.employeeName || !newEmployee.contact) {
      return toast.error("Employee name and contact are required");
    }

    try {
      setSaving(true);

      await employeeRepository.create(newEmployee);

      toast.success("Employee saved locally");

      setNewEmployee(emptyEmployee);
      setShowAddModal(false);

      fetchEmployees();
    } catch (error) {
      toast.error(error.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (employee) => {
    setEditEmployee({
      localId: employee.localId,
      id: employee.id,
      employeeName: employee.employeeName || "",
      contact: employee.contact || "",
      email: employee.email || "",
      designation: employee.designation || "",
      salary: employee.salary || "",
      joiningDate: employee.joiningDate || "",
    });
  };

  const handleUpdate = async () => {
    if (!editEmployee.employeeName || !editEmployee.contact) {
      return toast.error("Employee name and contact are required");
    }

    try {
      setSaving(true);

      await employeeRepository.update(editEmployee.localId, editEmployee);

      toast.success("Employee updated locally");

      setEditEmployee(null);

      fetchEmployees();
    } catch (error) {
      toast.error(error.message || "Failed to update employee");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await employeeRepository.remove(deleteId);

      toast.success("Employee deleted locally");

      fetchEmployees();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }

    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr No</th>
                <th className={cellClass}>Employee Name</th>
                <th className={cellClass}>Contact</th>
                <th className={cellClass}>Email</th>
                <th className={cellClass}>Designation</th>
                <th className={cellClass}>Salary</th>
                <th className={cellClass}>Joining Date</th>
                <th className={cellClass}>Sync Status</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {activeEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <tr
                    key={employee.localId}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {employee.employeeName}
                    </td>

                    <td className={cellClass}>{employee.contact}</td>

                    <td className={cellClass}>{employee.email || "-"}</td>

                    <td className={cellClass}>
                      {employee.designation || "-"}
                    </td>

                    <td className={cellClass}>{employee.salary || "-"}</td>

                    <td className={cellClass}>
                      {employee.joiningDate || "-"}
                    </td>

                    <td className={cellClass}>
                      <SyncBadge
                        status={employee.syncState}
                        error={employee.syncError}
                        isOnline={isOnline}
                      />
                    </td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewEmployee(employee)}
                          className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => openEditModal(employee)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => setDeleteId(employee.localId)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Add Employee
              </h2>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewEmployee(emptyEmployee);
                }}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="employeeName"
                placeholder="Employee Name"
                value={newEmployee.employeeName}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="contact"
                placeholder="Contact"
                value={newEmployee.contact}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="designation"
                placeholder="Designation"
                value={newEmployee.designation}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="salary"
                type="number"
                placeholder="Salary"
                value={newEmployee.salary}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="joiningDate"
                type="date"
                value={newEmployee.joiningDate}
                onChange={handleNewChange}
                className={inputClass}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewEmployee(emptyEmployee);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveNew}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Create Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Employee Details
              </h2>

              <button
                onClick={() => setViewEmployee(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {viewEmployee.employeeName}
              </p>
              <p>
                <strong>Contact:</strong> {viewEmployee.contact}
              </p>
              <p>
                <strong>Email:</strong> {viewEmployee.email || "-"}
              </p>
              <p>
                <strong>Designation:</strong>{" "}
                {viewEmployee.designation || "-"}
              </p>
              <p>
                <strong>Salary:</strong> {viewEmployee.salary || "-"}
              </p>
              <p>
                <strong>Joining Date:</strong>{" "}
                {viewEmployee.joiningDate || "-"}
              </p>
              <p className="flex items-center gap-2">
                <strong>Sync Status:</strong>{" "}
                <SyncBadge
                  status={viewEmployee.syncState}
                  error={viewEmployee.syncError}
                  isOnline={isOnline}
                />
              </p>
              {viewEmployee.syncState === "FAILED" && viewEmployee.syncError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {viewEmployee.syncError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {editEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Employee
              </h2>

              <button
                onClick={() => setEditEmployee(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="employeeName"
                value={editEmployee.employeeName}
                onChange={handleEditChange}
                placeholder="Employee name"
                className={inputClass}
              />

              <input
                name="contact"
                value={editEmployee.contact}
                onChange={handleEditChange}
                placeholder="Contact"
                className={inputClass}
              />

              <input
                name="email"
                type="email"
                value={editEmployee.email}
                onChange={handleEditChange}
                placeholder="Email"
                className={inputClass}
              />

              <input
                name="designation"
                value={editEmployee.designation}
                onChange={handleEditChange}
                placeholder="Designation"
                className={inputClass}
              />

              <input
                name="salary"
                type="number"
                value={editEmployee.salary}
                onChange={handleEditChange}
                placeholder="Salary"
                className={inputClass}
              />

              <input
                name="joiningDate"
                type="date"
                value={editEmployee.joiningDate}
                onChange={handleEditChange}
                className={inputClass}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => setEditEmployee(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Employee
            </h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this employee?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeTable;