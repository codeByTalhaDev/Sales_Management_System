import { useEffect, useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

import EmployeeTable from "../../components/employee/EmployeeTable";

import * as employeeRepository from "../../offline/modules/people/employee/repository";
import * as queue from "../../offline/core/queue";
import { SYNC_STATUS } from "../../offline/constants/syncStatus";
import { SYNC_COMPLETE_EVENT } from "../../offline/core/syncManager";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /**
   * Load employees from IndexedDB, and correlate each one with its
   * queue entry (if any) so the UI can show whether it's still
   * pending, actually failed to sync, or fully synced.
   */
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data = await employeeRepository.getAll();
      const queueItems = await queue.getByModule("employees");

      const queueByLocalId = new Map(
        queueItems.map((item) => [item.localId, item])
      );

      const merged = data.map((employee) => {
        const queueItem = queueByLocalId.get(employee.localId);

        let syncState = employee.syncStatus; // PENDING or SYNCED
        let syncError = null;

        if (queueItem?.status === SYNC_STATUS.FAILED) {
          syncState = SYNC_STATUS.FAILED;
          syncError = queueItem.errorMessage;
        }

        return {
          ...employee,
          syncState,
          syncError,
        };
      });

      setEmployees(merged);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete Employee
   */
  const handleDelete = async (localId) => {
    try {
      await employeeRepository.remove(localId);

      toast.success("Employee deleted");

      await fetchEmployees();
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchEmployees();

    // Re-fetch automatically whenever a background sync cycle finishes
    // — so PENDING/FAILED/SYNCED badges update live without the user
    // needing to manually reload the page.
    const handleSyncComplete = () => {
      fetchEmployees();
    };

    window.addEventListener(SYNC_COMPLETE_EVENT, handleSyncComplete);

    return () => {
      window.removeEventListener(SYNC_COMPLETE_EVENT, handleSyncComplete);
    };
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