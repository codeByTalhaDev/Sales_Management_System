import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import StockTable from "../../components/stock/StockTable";

const StockList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      setLoading(true);

      const res = await api.get("/stock/list");

      setProducts(res.data.products || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load stock list"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Stock List
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View all inventory products and their available quantity.
        </p>
      </div>

      {/* Table */}
      <StockTable
        products={products}
        loading={loading}
      />
    </div>
  );
};

export default StockList;