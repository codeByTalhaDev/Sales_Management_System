import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

import CustomerTable from "../../components/customer/CustomerTable";

import * as customerRepository from "../../offline/modules/people/customer/repository";
import * as queue from "../../offline/core/queue";
import customerConfig from "../../offline/modules/people/customer/config";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /**
   * Load customers from IndexedDB, merged with their current queue
   * status (PENDING / PROCESSING / FAILED) and failure reason, if any,
   * so the table can show accurate real-time sync state per row.
   */
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const data = await customerRepository.getAll();
      const queueItems = await queue.getByModule(customerConfig.module);
      const queueMap = new Map(queueItems.map((q) => [q.localId, q]));

      const merged = data.map((customer) => {
        const queueItem = queueMap.get(customer.localId);
        return {
          ...customer,
          queueStatus: queueItem?.status ?? null,
          queueError: queueItem?.errorMessage ?? null,
        };
      });

      setCustomers(merged);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete Customer
   */
  const handleDelete = async (localId) => {
    try {
      await customerRepository.remove(localId);

      toast.success("Customer deleted");

      await fetchCustomers();
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <Users size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Customers
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage customer records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      <CustomerTable
        customers={customers}
        loading={loading}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        fetchCustomers={fetchCustomers}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default Customers;