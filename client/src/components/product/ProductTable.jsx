import { useState } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const emptyProduct = {
  productName: "",
  barcode: "",
  autoGenerateBarcode: false,
  categoryId: "",
  uomId: "",
  purchasePrice: "",
  salePrice: "",
  manageInventory: false,
  quantity: "",
  reorderQuantity: "",
  hasExpiryDate: false,
  expiryDate: "",
  description: "",
  image: null,
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

const ProductTable = ({
  products,
  categories,
  uoms,
  loading,
  showAddModal,
  setShowAddModal,
  fetchProducts,
  onDelete,
}) => {
  const [formData, setFormData] = useState(emptyProduct);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = products.slice(start, start + rowsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "autoGenerateBarcode") {
      setFormData((prev) => ({
        ...prev,
        autoGenerateBarcode: checked,
        barcode: checked ? `BAR-${Date.now()}` : "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "autoGenerateBarcode") {
      setEditProduct((prev) => ({
        ...prev,
        autoGenerateBarcode: checked,
        barcode: checked ? `BAR-${Date.now()}` : "",
      }));

      return;
    }

    setEditProduct((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const createPayload = (data) => {
    const payload = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        payload.append(key, data[key]);
      }
    });

    return payload;
  };

  const handleCreate = async () => {
    if (!formData.productName || !formData.categoryId || !formData.uomId) {
      return toast.error("Product name, category and UOM are required");
    }

    try {
      setSaving(true);

      const payload = createPayload(formData);

      const res = await api.post("/products", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Product created");

      setFormData(emptyProduct);
      setShowAddModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditProduct({
      id: item.id,
      productName: item.productName || "",
      barcode: item.barcode || "",
      autoGenerateBarcode: item.autoGenerateBarcode || false,
      categoryId: item.categoryId || "",
      uomId: item.uomId || "",
      purchasePrice: item.purchasePrice || "",
      salePrice: item.salePrice || "",
      manageInventory: item.manageInventory || false,
      quantity: item.quantity || "",
      reorderQuantity: item.reorderQuantity || "",
      hasExpiryDate: item.hasExpiryDate || false,
      expiryDate: item.expiryDate || "",
      description: item.description || "",
      image: null,
      oldImage: item.image || "",
    });
  };

  const handleUpdate = async () => {
    if (
      !editProduct.productName ||
      !editProduct.categoryId ||
      !editProduct.uomId
    ) {
      return toast.error("Product name, category and UOM are required");
    }

    try {
      setSaving(true);

      const payload = createPayload(editProduct);

      const res = await api.put(`/products/${editProduct.id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Product updated");

      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    await onDelete(deleteId);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-hidden">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr No</th>
                <th className={cellClass}>Image</th>
                <th className={cellClass}>Product</th>
                <th className={cellClass}>Barcode</th>
                <th className={cellClass}>Category</th>
                <th className={cellClass}>UOM</th>
                <th className={cellClass}>Sale Price</th>
                <th className={cellClass}>Stock</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No product found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>{start + index + 1}</td>

                    <td className={cellClass}>
                      {item.image ? (
                        <img
                          src={`http://localhost:5000/${item.image}`}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {item.productName}
                    </td>

                    <td className={cellClass}>{item.barcode || "-"}</td>

                    <td className={cellClass}>
                      {item.category?.categoryName || "-"}
                    </td>

                    <td className={cellClass}>{item.uom?.shortCode || "-"}</td>

                    <td className={cellClass}>{item.salePrice || 0}</td>

                    <td className={cellClass}>
                      {item.manageInventory
                        ? item.quantity || 0
                        : "Not tracked"}
                    </td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewProduct(item)}
                          className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <ProductFormModal
          title="Add Product"
          data={formData}
          categories={categories}
          uoms={uoms}
          onChange={handleChange}
          onClose={() => {
            setShowAddModal(false);
            setFormData(emptyProduct);
          }}
          onSubmit={handleCreate}
          saving={saving}
          buttonText="Create Product"
        />
      )}

      {editProduct && (
        <ProductFormModal
          title="Edit Product"
          data={editProduct}
          categories={categories}
          uoms={uoms}
          onChange={handleEditChange}
          onClose={() => setEditProduct(null)}
          onSubmit={handleUpdate}
          saving={saving}
          buttonText="Update"
        />
      )}

      {viewProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Product Details
              </h2>

              <button
                onClick={() => setViewProduct(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            {viewProduct.image && (
              <img
                src={`http://localhost:5000/${viewProduct.image}`}
                alt={viewProduct.productName}
                className="w-28 h-28 object-cover rounded-xl border mb-4"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {viewProduct.productName}
              </p>
              <p>
                <strong>Barcode:</strong> {viewProduct.barcode || "-"}
              </p>
              <p>
                <strong>Category:</strong>{" "}
                {viewProduct.category?.categoryName || "-"}
              </p>
              <p>
                <strong>UOM:</strong> {viewProduct.uom?.shortCode || "-"}
              </p>
              <p>
                <strong>Purchase:</strong> {viewProduct.purchasePrice || 0}
              </p>
              <p>
                <strong>Sale:</strong> {viewProduct.salePrice || 0}
              </p>
              <p>
                <strong>Inventory:</strong>{" "}
                {viewProduct.manageInventory ? "Yes" : "No"}
              </p>
              <p>
                <strong>Quantity:</strong> {viewProduct.quantity || 0}
              </p>
              <p>
                <strong>Reorder Qty:</strong> {viewProduct.reorderQuantity || 0}
              </p>
              <p>
                <strong>Expiry:</strong>{" "}
                {viewProduct.hasExpiryDate
                  ? viewProduct.expiryDate || "-"
                  : "No"}
              </p>
              <p className="sm:col-span-2">
                <strong>Description:</strong> {viewProduct.description || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Product
            </h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this product?
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProductFormModal = ({
  title,
  data,
  categories,
  uoms,
  onChange,
  onClose,
  onSubmit,
  saving,
  buttonText,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>

          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            name="productName"
            placeholder="Product Name"
            value={data.productName}
            onChange={onChange}
            className={inputClass}
          />

          <select
            name="categoryId"
            value={data.categoryId}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">Select Category</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.categoryName}
              </option>
            ))}
          </select>

          <select
            name="uomId"
            value={data.uomId}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">Select UOM</option>
            {uoms.map((item) => (
              <option key={item.id} value={item.id}>
                {item.uomName} ({item.shortCode})
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="autoGenerateBarcode"
              checked={data.autoGenerateBarcode}
              onChange={onChange}
              className="w-4 h-4"
            />
            Auto Generate Barcode
          </label>

          <input
            name="barcode"
            placeholder="Barcode"
            value={data.barcode}
            onChange={onChange}
            disabled={data.autoGenerateBarcode}
            className={inputClass}
          />

          <input
            name="purchasePrice"
            type="number"
            placeholder="Purchase Price"
            value={data.purchasePrice}
            onChange={onChange}
            className={inputClass}
          />

          <input
            name="salePrice"
            type="number"
            placeholder="Sale Price"
            value={data.salePrice}
            onChange={onChange}
            className={inputClass}
          />

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              name="manageInventory"
              type="checkbox"
              checked={data.manageInventory}
              onChange={onChange}
              className="w-4 h-4"
            />
            Manage Inventory
          </label>

          {data.manageInventory && (
            <>
              <input
                name="quantity"
                type="number"
                placeholder="Quantity"
                value={data.quantity}
                onChange={onChange}
                className={inputClass}
              />

              <input
                name="reorderQuantity"
                type="number"
                placeholder="Reorder Quantity"
                value={data.reorderQuantity}
                onChange={onChange}
                className={inputClass}
              />
            </>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="hasExpiryDate"
              checked={data.hasExpiryDate}
              onChange={onChange}
              className="w-4 h-4"
            />
            Has Expiry Date
          </label>

          {data.hasExpiryDate && (
            <input
              type="date"
              name="expiryDate"
              value={data.expiryDate}
              onChange={onChange}
              className={inputClass}
            />
          )}

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={onChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={data.description}
            onChange={onChange}
            className={`${inputClass} sm:col-span-2 lg:col-span-3 min-h-24 resize-none`}
          />

          <div className="sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row justify-end gap-3 pt-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
