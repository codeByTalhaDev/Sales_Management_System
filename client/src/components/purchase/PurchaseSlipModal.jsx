import { ReceiptText, Printer, X } from "lucide-react";

const cellClass = "px-4 py-4";

/**
 * Shared purchase slip modal.
 *
 * Expected `slip` shape:
 * {
 *   purchaseNo: string,
 *   supplier: { supplierName } | null,
 *   purchaseDate: string,
 *   notes: string,
 *   items: [{ product: { productName }, quantity, purchasePrice, subtotal }],
 *   totalAmount: number,
 *   paidAmount: number,
 *   remainingBalance: number,
 * }
 *
 * `showPrint` controls whether the Print button is shown (AddPurchase wants it,
 * PurchaseTable can enable it too since it's the same slip).
 */
const PurchaseSlipModal = ({ slip, onClose, showPrint = true }) => {
  if (!slip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500">
              <ReceiptText size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Purchase Slip
              </h2>
              <p className="text-sm text-gray-500">{slip.purchaseNo}</p>
            </div>
          </div>

          <button onClick={onClose} className="cursor-pointer">
            <X />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5">
          <p>
            <strong>Supplier:</strong> {slip.supplier?.supplierName || "-"}
          </p>

          <p>
            <strong>Date:</strong> {slip.purchaseDate}
          </p>

          <p>
            <strong>Purchase No:</strong> {slip.purchaseNo}
          </p>

          <p>
            <strong>Notes:</strong> {slip.notes || "-"}
          </p>
        </div>

        <div className="overflow-x-auto border rounded-2xl mb-5">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-orange-50">
              <tr className="text-left text-gray-700">
                <th className={cellClass}>Sr</th>
                <th className={cellClass}>Product</th>
                <th className={cellClass}>Qty</th>
                <th className={cellClass}>Price</th>
                <th className={cellClass}>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {slip.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className={cellClass}>{index + 1}</td>

                  <td className={cellClass}>
                    {item.product?.productName || "-"}
                  </td>

                  <td className={cellClass}>{item.quantity}</td>

                  <td className={cellClass}>
                    Rs. {Number(item.purchasePrice || 0).toFixed(2)}
                  </td>

                  <td className={cellClass}>
                    Rs. {Number(item.subtotal || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto max-w-sm bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Total Amount</span>
            <strong>Rs. {Number(slip.totalAmount || 0).toFixed(2)}</strong>
          </div>

          <div className="flex justify-between">
            <span>Paid Amount</span>
            <strong>Rs. {Number(slip.paidAmount || 0).toFixed(2)}</strong>
          </div>

          <div className="flex justify-between border-t pt-3">
            <span>Remaining</span>
            <strong className="text-red-600">
              Rs. {Number(slip.remainingBalance || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
          {showPrint && (
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={18} />
              Print
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSlipModal;