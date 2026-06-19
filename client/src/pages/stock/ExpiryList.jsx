import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ExpiryTable from "../../components/stock/ExpiryTable";

const ExpiryList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpiryProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/stock/expiry");

      setProducts(res.data.products || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load expiry list"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Expiry List
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Products with expiry dates and expiry status.
        </p>
      </div>

      <ExpiryTable products={products} loading={loading} />
    </div>
  );
};

export default ExpiryList;