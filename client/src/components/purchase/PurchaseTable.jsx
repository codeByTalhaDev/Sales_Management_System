import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";

import PurchaseSlipModal from "./PurchaseSlipModal";

const cellClass = "px-4 py-4";

const PurchaseTable = ({ purchases, loading, onDelete }) => {
  const [viewPurchase, setViewPurchase] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(purchases.length / rowsPerPage);

  const paginatedPurchases = purchases.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const confirmDelete = async () => {
    await onDelete(deleteId);
    setDeleteId(null);
  };

  // Normalize a purchase row from GET /purchases into the shape
  // PurchaseSlipModal expects (items use `subtotal`, not `total`).
  const buildSlip = (purchase) => ({
    purchaseNo: purchase.purchaseNo,
    supplier: purchase.supplier,
    purchaseDate: purchase.purchaseDate,
    notes: purchase.notes,
    totalAmount: purchase.totalAmount,
    paidAmount: purchase.paidAmount,
    remainingBalance: purchase.remainingBalance,
    items: purchase.items?.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      subtotal: item.total,
    })),
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading purchases...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr No</th>
                <th className={cellClass}>Purchase No</th>
                <th className={cellClass}>Supplier</th>
                <th className={cellClass}>Date</th>
                <th className={cellClass}>Items</th>
                <th className={cellClass}>Total</th>
                <th className={cellClass}>Paid</th>
                <th className={cellClass}>Remaining</th>
                <th className={cellClass}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">
                    No purchase found
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {item.purchaseNo}
                    </td>

                    <td className={cellClass}>
                      {item.supplier?.supplierName || "-"}
                    </td>

                    <td className={cellClass}>{item.purchaseDate}</td>

                    <td className={cellClass}>{item.items?.length || 0}</td>

                    <td className={cellClass}>
                      Rs. {Number(item.totalAmount || 0).toFixed(2)}
                    </td>

                    <td className={cellClass}>
                      Rs. {Number(item.paidAmount || 0).toFixed(2)}
                    </td>

                    <td className={cellClass}>
                      <span
                        className={`font-medium ${
                          Number(item.remainingBalance || 0) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        Rs. {Number(item.remainingBalance || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className={cellClass}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewPurchase(item)}
                          className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition cursor-pointer"
                        >
                          <Eye size={18} />
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

      {viewPurchase && (
        <PurchaseSlipModal
          slip={buildSlip(viewPurchase)}
          onClose={() => setViewPurchase(null)}
          showPrint={true}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Delete Purchase
            </h2>

            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this purchase?
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

export default PurchaseTable;