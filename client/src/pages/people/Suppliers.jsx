import { useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";

import api from "../../api/axios";
import toast from "react-hot-toast";

import SupplierTable from "../../components/supplier/SupplierTable";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/suppliers");

      setSuppliers(res.data.suppliers || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch suppliers"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/suppliers/${id}`);

      toast.success(res.data.message || "Supplier deleted");

      fetchSuppliers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  useEffect(() => {
    fetchSuppliers();
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