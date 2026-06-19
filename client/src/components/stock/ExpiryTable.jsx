import { useState } from "react";

const cellClass = "px-4 py-4";

const ExpiryTable = ({ products, loading }) => {
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(products.length / rowsPerPage);

  const paginatedProducts = products.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    const diffTime = expiry - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        text: "Expired",
        daysLeft,
        className: "bg-red-100 text-red-600",
      };
    }

    if (daysLeft <= 30) {
      return {
        text: "Expiring Soon",
        daysLeft,
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      text: "Valid",
      daysLeft,
      className: "bg-green-100 text-green-600",
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading expiry products...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-orange-50">
            <tr className="text-left text-gray-700">
              <th className={cellClass}>Sr No</th>
              <th className={cellClass}>Category</th>
              <th className={cellClass}>Product</th>
              <th className={cellClass}>UOM</th>
              <th className={cellClass}>Expiry Date</th>
              <th className={cellClass}>Days Left</th>
              <th className={cellClass}>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No expiry products found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((item, index) => {
                const status = getExpiryStatus(item.expiryDate);

                return (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-slate-50 transition"
                  >
                    <td className={cellClass}>
                      {(page - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className={cellClass}>
                      {item.category?.categoryName || "-"}
                    </td>

                    <td className={`${cellClass} font-medium text-gray-800`}>
                      {item.productName}
                    </td>

                    <td className={cellClass}>{item.uom?.shortCode || "-"}</td>

                    <td className={cellClass}>{item.expiryDate || "-"}</td>

                    <td className={cellClass}>
                      {status.daysLeft < 0
                        ? `${Math.abs(status.daysLeft)} days ago`
                        : `${status.daysLeft} days`}
                    </td>

                    <td className={cellClass}>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })
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
  );
};

export default ExpiryTable;
