import { useEffect, useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

import PurchaseSlipModal from "../../components/purchase/PurchaseSlipModal";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

const AddPurchase = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [slip, setSlip] = useState(null);

  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: "",
    paidAmount: "",
    notes: "",
    items: [
      {
        productId: "",
        quantity: "",
        purchasePrice: "",
      },
    ],
  });

  const fetchDropdownData = async () => {
    try {
      const [supplierRes, productRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/products"),
      ]);

      setSuppliers(supplierRes.data.suppliers || []);
      setProducts(productRes.data.products || []);
    } catch (error) {
      toast.error("Failed to load suppliers/products");
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleMainChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    const updatedItems = [...formData.items];
    updatedItems[index][name] = value;

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: "",
          quantity: "",
          purchasePrice: "",
        },
      ],
    });
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) {
      return toast.error("At least one product is required");
    }

    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const getSelectedProduct = (productId) => {
    return products.find((product) => product.id === Number(productId));
  };

  const getSelectedSupplier = () => {
    return suppliers.find(
      (supplier) => supplier.id === Number(formData.supplierId)
    );
  };

  const getItemTotal = (item) => {
    return Number(item.quantity || 0) * Number(item.purchasePrice || 0);
  };

  const totalAmount = formData.items.reduce((sum, item) => {
    return sum + getItemTotal(item);
  }, 0);

  const paidAmount = Number(formData.paidAmount || 0);
  const remainingBalance = totalAmount - paidAmount;

  const handleSubmit = async () => {
    if (!formData.supplierId || !formData.purchaseDate) {
      return toast.error("Supplier and purchase date are required");
    }

    const invalidItem = formData.items.some(
      (item) => !item.productId || !item.quantity || !item.purchasePrice
    );

    if (invalidItem) {
      return toast.error("Please complete all product rows");
    }

    if (paidAmount > totalAmount) {
      return toast.error("Paid amount cannot be greater than total amount");
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        paidAmount,
      };

      const res = await api.post("/purchases", payload);

      toast.success(res.data.message || "Purchase created successfully");

      setSlip({
        purchaseNo: res.data.purchase?.purchaseNo || "PUR",
        supplier: getSelectedSupplier(),
        purchaseDate: formData.purchaseDate,
        items: formData.items.map((item) => ({
          ...item,
          product: getSelectedProduct(item.productId),
          subtotal: getItemTotal(item),
        })),
        totalAmount,
        paidAmount,
        remainingBalance,
        notes: formData.notes,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSlip = () => {
    setSlip(null);
    navigate("/purchase/list");
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-xl text-orange-500">
            <ShoppingCart size={22} />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add Purchase
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Create purchase bill, update stock, and generate purchase slip.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="supplierId"
            value={formData.supplierId}
            onChange={handleMainChange}
            className={inputClass}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplierName}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleMainChange}
            className={inputClass}
          />
        </div>

        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-orange-50">
                <tr className="text-left text-gray-700">
                  <th className={cellClass}>Sr No</th>
                  <th className={cellClass}>Product</th>
                  <th className={cellClass}>Quantity</th>
                  <th className={cellClass}>Price</th>
                  <th className={cellClass}>Subtotal</th>
                  <th className={cellClass}>Action</th>
                </tr>
              </thead>

              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className={cellClass}>{index + 1}</td>

                    <td className={cellClass}>
                      <select
                        name="productId"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, e)}
                        className={inputClass}
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className={cellClass}>
                      <input
                        type="number"
                        name="quantity"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        className={inputClass}
                      />
                    </td>

                    <td className={cellClass}>
                      <input
                        type="number"
                        name="purchasePrice"
                        placeholder="Price"
                        value={item.purchasePrice}
                        onChange={(e) => handleItemChange(index, e)}
                        className={inputClass}
                      />
                    </td>

                    <td className={cellClass}>
                      Rs. {getItemTotal(item).toFixed(2)}
                    </td>

                    <td className={cellClass}>
                      <button
                        onClick={() => removeItemRow(index)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                      >
                        <Minus size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={addItemRow}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Add Product Row
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <textarea
              name="notes"
              placeholder="Notes"
              value={formData.notes}
              onChange={handleMainChange}
              className={`${inputClass} min-h-28 resize-none`}
            />
          </div>

          <div className="bg-orange-50 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <strong>Rs. {totalAmount.toFixed(2)}</strong>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Paid Amount
              </label>

              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleMainChange}
                placeholder="Enter paid amount"
                className={inputClass}
              />
            </div>

            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-gray-600">Remaining Balance</span>
              <strong className="text-red-600">
                Rs. {remainingBalance.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => navigate("/purchase/list")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Generate Slip"}
          </button>
        </div>
      </div>

      <PurchaseSlipModal slip={slip} onClose={handleCloseSlip} />
    </section>
  );
};

export default AddPurchase;