import { useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../api/axios";
import toast from "react-hot-toast";

import PurchaseTable from "../../components/purchase/PurchaseTable";

const PurchaseList = () => {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);

      const res = await api.get("/purchases");

      setPurchases(res.data.purchases || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/purchases/${id}`);

      toast.success(res.data.message || "Purchase deleted");

      fetchPurchases();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <ShoppingCart size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Purchase List
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                View purchase bills and purchase details.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/purchase/add")}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Purchase
          </button>
        </div>
      </div>

      <PurchaseTable
        purchases={purchases}
        loading={loading}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default PurchaseList;