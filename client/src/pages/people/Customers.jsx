import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

import CustomerTable from "../../components/customer/CustomerTable";

import * as customerRepository from "../../offline/modules/people/customer/repository";
import * as queue from "../../offline/core/queue";
import { SYNC_STATUS } from "../../offline/constants/syncStatus";
import { SYNC_COMPLETE_EVENT } from "../../offline/core/syncManager";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /**
   * Load customers from IndexedDB, and correlate each one with its
   * queue entry (if any) so the UI can show whether it's still
   * pending, actually failed to sync, or fully synced.
   */
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const data = await customerRepository.getAll();
      const queueItems = await queue.getByModule("customers");

      const queueByLocalId = new Map(
        queueItems.map((item) => [item.localId, item])
      );

      const merged = data.map((customer) => {
        const queueItem = queueByLocalId.get(customer.localId);

        let syncState = customer.syncStatus; // PENDING or SYNCED
        let syncError = null;

        if (queueItem?.status === SYNC_STATUS.FAILED) {
          syncState = SYNC_STATUS.FAILED;
          syncError = queueItem.errorMessage;
        }

        return {
          ...customer,
          syncState,
          syncError,
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

    // Re-fetch automatically whenever a background sync cycle finishes
    // (server came back online, periodic sync ran, etc.) — so PENDING/
    // FAILED/SYNCED badges update live without the user needing to
    // manually reload the page.
    const handleSyncComplete = () => {
      fetchCustomers();
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