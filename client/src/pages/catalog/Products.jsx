import { useEffect, useState } from "react";
import { Plus, Package } from "lucide-react";

import api from "../../api/axios";
import toast from "react-hot-toast";

import ProductTable from "../../components/product/ProductTable";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/products");

      setProducts(res.data.products || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [categoryRes, uomRes] = await Promise.all([
        api.get("/categories"),
        api.get("/uoms"),
      ]);

      setCategories(categoryRes.data.categories || []);
      setUoms(uomRes.data.uoms || []);
    } catch (error) {
      toast.error("Failed to load dropdown data");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/products/${id}`);

      toast.success(res.data.message || "Product deleted");

      fetchProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  return (
    <section className="w-full space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Products
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Manage catalog products
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <ProductTable
        products={products}
        categories={categories}
        uoms={uoms}
        loading={loading}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        fetchProducts={fetchProducts}
        onDelete={handleDelete}
      />
    </section>
  );
};

export default Products;