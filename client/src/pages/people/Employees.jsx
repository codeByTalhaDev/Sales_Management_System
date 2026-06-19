import { useEffect, useState } from "react";
import { Plus, Briefcase } from "lucide-react";

import api from "../../api/axios";
import toast from "react-hot-toast";

import EmployeeTable from "../../components/employee/EmployeeTable";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await api.get("/employees");

      setEmployees(res.data.employees || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch employees"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/employees/${id}`);

      toast.success(res.data.message || "Employee deleted");

      fetchEmployees();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <Briefcase size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Employees
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage employee records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      <EmployeeTable
        employees={employees}
        loading={loading}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        fetchEmployees={fetchEmployees}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default Employees;