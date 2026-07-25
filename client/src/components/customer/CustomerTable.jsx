import { useState, useEffect } from "react";
import { Pencil, Trash2, X, Eye } from "lucide-react";
import * as customerRepository from "../../offline/modules/people/customer/repository";
import useOnlineStatus from "../../hooks/useOnlineStatus";
import toast from "react-hot-toast";

const emptyCustomer = {
  customerName: "",
  contact: "",
  cnic: "",
  email: "",
  address: "",
};

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

const cellClass = "px-4 py-4";

/**
 * A small styled hover tooltip — replaces the browser's native title
 * bubble (which looks inconsistent and dated) with one matching the
 * app's own design.
 */
const Tooltip = ({ text, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 w-max max-w-[220px] pointer-events-none">
          <span className="block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-snug">
            {text}
          </span>
          <span className="block w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </span>
      )}
    </span>
  );
};

/**
 * Shows the live sync state of a customer record:
 * - yellow "Pending" — saved locally, offline, nothing can happen yet
 * - blue "Syncing..." — saved locally, browser is online, a sync
 *   attempt is imminent or already in progress
 * - green "Synced" — confirmed saved on the server
 * - red "Failed" — the server rejected it; hover to see why
 * Comes from Customers.jsx, which correlates each customer with its
 * queue entry (see queue.getByModule) to compute syncState/syncError.
 */
const SyncBadge = ({ status, error, isOnline }) => {
  if (status === "FAILED") {
    const badge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Failed
      </span>
    );

    return error ? <Tooltip text={error}>{badge}</Tooltip> : badge;
  }

  if (status === "PENDING" || status === "PROCESSING") {
    if (isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Syncing...
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Synced
    </span>
  );
};

const CustomerTable = ({
  customers,
  loading,
  fetchCustomers,
  showAddModal,
  setShowAddModal,
}) => {
  const [newCustomer, setNewCustomer] = useState(emptyCustomer);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const isOnline = useOnlineStatus();

  const rowsPerPage = 10;

  const activeCustomers = customers.filter((customer) => !customer.isDeleted);

  const totalPages = Math.ceil(activeCustomers.length / rowsPerPage);

  const paginatedCustomers = [...activeCustomers]
    .sort((a, b) => b.localId - a.localId)
    .slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleNewChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditCustomer({
      ...editCustomer,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveNew = async () => {
    if (!newCustomer.customerName || !newCustomer.contact) {
      return toast.error("Customer name and contact are required");
    }

    try {
      setSaving(true);

      await customerRepository.create(newCustomer);

      toast.success("Customer saved locally");

      setNewCustomer(emptyCustomer);
      setShowAddModal(false);

      fetchCustomers();
    } catch (error) {
      toast.error(error.message || "Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer({
      localId: customer.localId,
      id: customer.id,
      customerName: customer.customerName || "",
      contact: customer.contact || "",
      cnic: customer.cnic || "",
      email: customer.email || "",
      address: customer.address || "",
    });
  };

  const handleUpdate = async () => {
    if (!editCustomer.customerName || !editCustomer.contact) {
      return toast.error("Customer name and contact are required");
    }

    try {
      setSaving(true);

      await customerRepository.update(
        editCustomer.localId,
        editCustomer
      );

      toast.success("Customer updated locally");

      setEditCustomer(null);

      fetchCustomers();
    } catch (error) {
      toast.error(error.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await customerRepository.remove(deleteId);

      toast.success("Customer deleted locally");

      fetchCustomers();
    } catch (error) {
      toast.error(error.message || "Delete failed");
    }

    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr No</th>
                <th className={cellClass}>Customer Name</th>
                <th className={cellClass}>Contact</th>
                <th className={cellClass}>CNIC</th>
                <th className={cellClass}>Email</th>
                <th className={cellClass}>Sync Status</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {activeCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => (
                  <tr
                    key={customer.localId}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {customer.customerName}
                    </td>

                    <td className={cellClass}>{customer.contact}</td>

                    <td className={cellClass}>{customer.cnic || "-"}</td>

                    <td className={cellClass}>{customer.email || "-"}</td>

                    <td className={cellClass}>
                      <SyncBadge
                        status={customer.syncState}
                        error={customer.syncError}
                        isOnline={isOnline}
                      />
                    </td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewCustomer(customer)}
                          className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => setDeleteId(customer.localId)}
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
                Add Customer
              </h2>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer(emptyCustomer);
                }}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="customerName"
                placeholder="Customer Name"
                value={newCustomer.customerName}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="contact"
                placeholder="Contact"
                value={newCustomer.contact}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="cnic"
                placeholder="CNIC"
                value={newCustomer.cnic}
                onChange={handleNewChange}
                className={inputClass}
              />

              <input
                name="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={handleNewChange}
                className={inputClass}
              />

              <textarea
                name="address"
                placeholder="Address"
                value={newCustomer.address}
                onChange={handleNewChange}
                className={`${inputClass} sm:col-span-2 min-h-24 resize-none`}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCustomer(emptyCustomer);
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
                  {saving ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Customer Details
              </h2>

              <button
                onClick={() => setViewCustomer(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Name:</strong> {viewCustomer.customerName}
              </p>
              <p>
                <strong>Contact:</strong> {viewCustomer.contact}
              </p>
              <p>
                <strong>CNIC:</strong> {viewCustomer.cnic || "-"}
              </p>
              <p>
                <strong>Email:</strong> {viewCustomer.email || "-"}
              </p>
              <p>
                <strong>Address:</strong> {viewCustomer.address || "-"}
              </p>
              <p className="flex items-center gap-2">
                <strong>Sync Status:</strong>{" "}
                <SyncBadge
                  status={viewCustomer.syncState}
                  error={viewCustomer.syncError}
                  isOnline={isOnline}
                />
              </p>
              {viewCustomer.syncState === "FAILED" && viewCustomer.syncError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {viewCustomer.syncError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {editCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Customer
              </h2>

              <button
                onClick={() => setEditCustomer(null)}
                className="cursor-pointer"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="customerName"
                value={editCustomer.customerName}
                onChange={handleEditChange}
                placeholder="Customer name"
                className={inputClass}
              />

              <input
                name="contact"
                value={editCustomer.contact}
                onChange={handleEditChange}
                placeholder="Contact"
                className={inputClass}
              />

              <input
                name="cnic"
                value={editCustomer.cnic}
                onChange={handleEditChange}
                placeholder="CNIC"
                className={inputClass}
              />

              <input
                name="email"
                value={editCustomer.email}
                onChange={handleEditChange}
                placeholder="Email"
                className={inputClass}
              />

              <textarea
                name="address"
                value={editCustomer.address}
                onChange={handleEditChange}
                placeholder="Address"
                className={`${inputClass} sm:col-span-2 min-h-24 resize-none`}
              />

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-3">
                <button
                  onClick={() => setEditCustomer(null)}
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
              Delete Customer
            </h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this customer?
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

export default CustomerTable;