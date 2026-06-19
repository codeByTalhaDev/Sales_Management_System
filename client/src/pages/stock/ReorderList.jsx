import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ReorderTable from "../../components/stock/ReorderTable";

const ReorderList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReorderProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/stock/reorder");

      setProducts(res.data.products || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load reorder list"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReorderProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Reorder List
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Products where quantity is less than or equal to reorder quantity.
        </p>
      </div>

      <ReorderTable products={products} loading={loading} />
    </div>
  );
};

export default ReorderList;