import { useState } from "react";
import { Pencil, Trash2, X, Eye } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const emptySupplier = {
  supplierName: "",
  contact: "",
  company: "",
  email: "",
  address: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

const SupplierTable = ({
  suppliers,
  loading,
  fetchSuppliers,
  onDelete,
  showAddModal,
  setShowAddModal,
}) => {
  const [newSupplier, setNewSupplier] = useState(emptySupplier);
  const [editSupplier, setEditSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(suppliers.length / rowsPerPage);

  const paginatedSuppliers = suppliers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleNewChange = (e) => {
    setNewSupplier({
      ...newSupplier,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditSupplier({
      ...editSupplier,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveNew = async () => {
    if (!newSupplier.supplierName || !newSupplier.contact) {
      return toast.error("Supplier name and contact are required");
    }

    try {
      setSaving(true);

      const res = await api.post("/suppliers", newSupplier);

      toast.success(res.data.message || "Supplier created");

      setNewSupplier(emptySupplier);
      setShowAddModal(false);
      fetchSuppliers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create supplier"
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (supplier) => {
    setEditSupplier({
      id: supplier.id,
      supplierName: supplier.supplierName || "",
      contact: supplier.contact || "",
      company: supplier.company || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
  };

  const handleUpdate = async () => {
    if (!editSupplier.supplierName || !editSupplier.contact) {
      return toast.error("Supplier name and contact are required");
    }

    try {
      setSaving(true);

      const res = await api.put(
        `/suppliers/${editSupplier.id}`,
        editSupplier
      );

      toast.success(res.data.message || "Supplier updated");

      setEditSupplier(null);
      fetchSuppliers();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update supplier"
      );
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
        <p className="text-gray-500">Loading suppliers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr No</th>
                <th className={cellClass}>Supplier Name</th>
                <th className={cellClass}>Contact</th>
                <th className={cellClass}>Company</th>
                <th className={cellClass}>Email</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {supplier.supplierName}
                    </td>

                    <td className={cellClass}>{supplier.contact}</td>

                    <td className={cellClass}>{supplier.company || "-"}</td>

                    <td className={cellClass}>{supplier.email || "-"}</td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewSupplier(supplier)}
                          className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => openEditModal(supplier)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => setDeleteId(supplier.id)}
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
            Page {page} of {totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Add Supplier
              </h2>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewSupplier(emptySupplier);
                }}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="supplierName"
                placeholder="Supplier Name"
                value={newSupplier.supplierName}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="contact"
                placeholder="Contact"
                value={newSupplier.contact}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="company"
                placeholder="Company"
                value={newSupplier.company}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="email"
                placeholder="Email"
                value={newSupplier.email}
                onChange={handleNewChange}
                className={inputClass}
              />

              <textarea
                name="address"
                placeholder="Address"
                value={newSupplier.address}
                onChange={handleNewChange}
                className={`${inputClass} sm:col-span-2 min-h-24 resize-none`}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSupplier(emptySupplier);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveNew}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Create Supplier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Supplier Details
              </h2>

              <button
                onClick={() => setViewSupplier(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {viewSupplier.supplierName}
              </p>
              <p>
                <strong>Contact:</strong> {viewSupplier.contact}
              </p>
              <p>
                <strong>Company:</strong> {viewSupplier.company || "-"}
              </p>
              <p>
                <strong>Email:</strong> {viewSupplier.email || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {editSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Supplier
              </h2>

              <button
                onClick={() => setEditSupplier(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="supplierName"
                value={editSupplier.supplierName}
                onChange={handleEditChange}
                placeholder="Supplier name"
                className={inputClass}
              />

              <input
                name="contact"
                value={editSupplier.contact}
                onChange={handleEditChange}
                placeholder="Contact"
                className={inputClass}
              />

              <input
                name="company"
                value={editSupplier.company}
                onChange={handleEditChange}
                placeholder="Company"
                className={inputClass}
              />

              <input
                name="email"
                value={editSupplier.email}
                onChange={handleEditChange}
                placeholder="Email"
                className={inputClass}
              />

              <textarea
                name="address"
                value={editSupplier.address}
                onChange={handleEditChange}
                placeholder="Address"
                className={`${inputClass} sm:col-span-2 min-h-24 resize-none`}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => setEditSupplier(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Supplier
            </h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this supplier?
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

export default SupplierTable;