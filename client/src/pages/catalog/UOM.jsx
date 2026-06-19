import { useEffect, useState } from "react";
import { Plus, Ruler } from "lucide-react";

import api from "../../api/axios";
import toast from "react-hot-toast";

import UOMTable from "../../components/uom/UOMTable";

const UOM = () => {
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUoms = async () => {
    try {
      setLoading(true);

      const res = await api.get("/uoms");

      setUoms(res.data.uoms || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch UOMs"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/uoms/${id}`);

      toast.success(res.data.message || "UOM deleted");

      fetchUoms();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  useEffect(() => {
    fetchUoms();
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <Ruler size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                UOM
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage units of measurement
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add UOM
          </button>
        </div>
      </div>

      <UOMTable
        uoms={uoms}
        loading={loading}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        fetchUoms={fetchUoms}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default UOM;