import { useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";
import toast from "react-hot-toast";

import SupplierTable from "../../components/supplier/SupplierTable";

import * as supplierRepository from "../../offline/modules/people/supplier/repository";
import * as queue from "../../offline/core/queue";
import { SYNC_STATUS } from "../../offline/constants/syncStatus";
import { SYNC_COMPLETE_EVENT } from "../../offline/core/syncManager";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /**
   * Load suppliers from IndexedDB, and correlate each one with its
   * queue entry (if any) so the UI can show whether it's still
   * pending, actually failed to sync, or fully synced.
   */
  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const data = await supplierRepository.getAll();
      const queueItems = await queue.getByModule("suppliers");

      const queueByLocalId = new Map(
        queueItems.map((item) => [item.localId, item])
      );

      const merged = data.map((supplier) => {
        const queueItem = queueByLocalId.get(supplier.localId);

        let syncState = supplier.syncStatus; // PENDING or SYNCED
        let syncError = null;

        if (queueItem?.status === SYNC_STATUS.FAILED) {
          syncState = SYNC_STATUS.FAILED;
          syncError = queueItem.errorMessage;
        }

        return {
          ...supplier,
          syncState,
          syncError,
        };
      });

      setSuppliers(merged);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete Supplier
   */
  const handleDelete = async (localId) => {
    try {
      await supplierRepository.remove(localId);

      toast.success("Supplier deleted");

      await fetchSuppliers();
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchSuppliers();

    // Re-fetch automatically whenever a background sync cycle finishes
    // — so PENDING/FAILED/SYNCED badges update live without the user
    // needing to manually reload the page.
    const handleSyncComplete = () => {
      fetchSuppliers();
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
              <Truck size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Suppliers
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage supplier records
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Supplier
          </button>
        </div>
      </div>

      <SupplierTable
        suppliers={suppliers}
        loading={loading}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        fetchSuppliers={fetchSuppliers}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default Suppliers;