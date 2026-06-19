import { useState } from "react";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const emptyUom = {
  uomName: "",
  shortCode: "",
  description: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

const UOMTable = ({
  uoms,
  loading,
  showAddModal,
  setShowAddModal,
  fetchUoms,
  onDelete,
}) => {
  const [formData, setFormData] = useState(emptyUom);
  const [viewUom, setViewUom] = useState(null);
  const [editUom, setEditUom] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(uoms.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedData = uoms.slice(start, start + rowsPerPage);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditUom({
      ...editUom,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async () => {
    if (!formData.uomName || !formData.shortCode) {
      return toast.error("UOM name and short code are required");
    }

    try {
      setSaving(true);
      const res = await api.post("/uoms", formData);

      toast.success(res.data.message || "UOM created");
      setFormData(emptyUom);
      setShowAddModal(false);
      fetchUoms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (item) => {
    setEditUom({
      id: item.id,
      uomName: item.uomName || "",
      shortCode: item.shortCode || "",
      description: item.description || "",
    });
  };

  const handleUpdate = async () => {
    if (!editUom.uomName || !editUom.shortCode) {
      return toast.error("UOM name and short code are required");
    }

    try {
      setSaving(true);
      const res = await api.put(`/uoms/${editUom.id}`, editUom);

      toast.success(res.data.message || "UOM updated");
      setEditUom(null);
      fetchUoms();
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
        <p className="text-gray-500">Loading UOMs...</p>
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
                <th className={cellClass}>UOM Name</th>
                <th className={cellClass}>Short Code</th>
                <th className={cellClass}>Description</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {uoms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No UOM found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>{start + index + 1}</td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {item.uomName}
                    </td>

                    <td className={cellClass}>{item.shortCode}</td>

                    <td className={cellClass}>{item.description || "-"}</td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewUom(item)}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Add UOM</h2>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData(emptyUom);
                }}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="uomName"
                placeholder="UOM Name"
                value={formData.uomName}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                name="shortCode"
                placeholder="Short Code"
                value={formData.shortCode}
                onChange={handleChange}
                className={inputClass}
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className={`${inputClass} min-h-24 resize-none`}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData(emptyUom);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating..." : "Create UOM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewUom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">UOM Details</h2>

              <button onClick={() => setViewUom(null)} className="cursor-pointer">
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>UOM Name:</strong> {viewUom.uomName}</p>
              <p><strong>Short Code:</strong> {viewUom.shortCode}</p>
              <p><strong>Description:</strong> {viewUom.description || "-"}</p>
            </div>
          </div>
        </div>
      )}

      {editUom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Edit UOM</h2>

              <button onClick={() => setEditUom(null)} className="cursor-pointer">
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="uomName"
                value={editUom.uomName}
                onChange={handleEditChange}
                placeholder="UOM Name"
                className={inputClass}
              />

              <input
                name="shortCode"
                value={editUom.shortCode}
                onChange={handleEditChange}
                placeholder="Short Code"
                className={inputClass}
              />

              <textarea
                name="description"
                value={editUom.description}
                onChange={handleEditChange}
                placeholder="Description"
                className={`${inputClass} min-h-24 resize-none`}
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => setEditUom(null)}
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Delete UOM</h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this UOM?
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

export default UOMTable;