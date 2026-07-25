import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Database, Trash2, Search, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import db from "../../offline/core/database";

/**
 * Generic offline-storage inspector.
 *
 * Reads db.tables dynamically — so it automatically covers every
 * current store (customers, queue, conflicts) and any future module
 * store (employees, suppliers, ...) with zero added code.
 *
 * Dev-only tool. Do not ship a route to this in production builds.
 */
const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
  SYNCED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
};

const StatusBadge = ({ value }) => {
  const cls = STATUS_COLORS[value];
  if (!cls) return <span>{String(value)}</span>;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}
    >
      {value}
    </span>
  );
};

const CellValue = ({ column, value }) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-300">—</span>;
  }

  if (column === "syncStatus" || column === "status" && STATUS_COLORS[value]) {
    return <StatusBadge value={value} />;
  }

  if (column === "isDeleted") {
    return value ? (
      <span className="text-red-500 font-medium">yes</span>
    ) : (
      <span className="text-gray-400">no</span>
    );
  }

  if (typeof value === "object") {
    return (
      <code className="text-xs bg-gray-50 px-1.5 py-0.5 rounded text-gray-600">
        {JSON.stringify(value)}
      </code>
    );
  }

  if (
    (column.toLowerCase().includes("at") || column === "lastAttemptAt") &&
    typeof value === "string" &&
    !isNaN(Date.parse(value))
  ) {
    return (
      <span className="text-gray-500 text-xs">
        {new Date(value).toLocaleString()}
      </span>
    );
  }

  return <span>{String(value)}</span>;
};

const RowDetailModal = ({ row, tableName, onClose }) => {
  if (!row) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {tableName} record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-3">
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className="grid grid-cols-3 gap-3 text-sm">
              <span className="text-gray-500 font-medium">{key}</span>
              <span className="col-span-2 text-gray-800 break-words">
                <CellValue column={key} value={value} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ open, tableName, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-100 p-2 rounded-xl text-red-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <h3 className="font-semibold text-gray-900">Clear table?</h3>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          This will permanently delete all rows in{" "}
          <span className="font-medium text-gray-700">"{tableName}"</span>.
          This cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white cursor-pointer"
          >
            Delete all
          </button>
        </div>
      </div>
    </div>
  );
};

const SyncInspector = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tableNames, setTableNames] = useState([]);
  const [activeTable, setActiveTableState] = useState(
    searchParams.get("table") || null
  );
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep the active table in sync with the URL (?table=...) so a
  // browser refresh reloads the same tab you were on, instead of
  // always resetting to the alphabetically-first table.
  const setActiveTable = (name) => {
    setActiveTableState(name);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("table", name);
      return next;
    });
  };

  const loadTableNames = useCallback(() => {
    const names = db.tables.map((t) => t.name).sort();
    setTableNames(names);

    if (names.length === 0) return;

    // Prefer whatever table is already named in the URL, as long as
    // it actually exists; otherwise fall back to the first table.
    const fromUrl = searchParams.get("table");
    if (fromUrl && names.includes(fromUrl)) {
      setActiveTableState(fromUrl);
    } else if (!activeTable || !names.includes(activeTable)) {
      setActiveTable(names[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTable]);

  const loadRows = useCallback(async (tableName) => {
    if (!tableName) return;
    setLoading(true);
    try {
      const data = await db.table(tableName).toArray();
      setRows(data);
    } catch (error) {
      console.error("SyncInspector load failed:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTableNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTable) loadRows(activeTable);
  }, [activeTable, loadRows]);

  const handleRefresh = async () => {
    await loadRows(activeTable);
    toast.success(`Refreshed "${activeTable}"`);
  };

  const handleClearTable = async () => {
    if (!activeTable) return;
    const count = rows.length;
    await db.table(activeTable).clear();
    await loadRows(activeTable);
    setConfirmOpen(false);
    toast.success(`Cleared ${count} row${count !== 1 ? "s" : ""} from "${activeTable}"`);
  };

  const allColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

  // Default to a compact set of columns so the grid fits without
  // horizontal scrolling on a typical laptop screen. Full detail is
  // always available via the row-click modal, or the "show all" toggle.
  const PRIORITY_FIELDS = [
    "localId",
    "id",
    "queueKey",
    "customerName",
    "module",
    "operation",
    "status",
    "syncStatus",
    "isDeleted",
    "retryCount",
  ];

  const compactColumns = (() => {
    const priority = PRIORITY_FIELDS.filter((f) => allColumns.includes(f));
    const rest = allColumns.filter((f) => !priority.includes(f));
    return [...priority, ...rest].slice(0, 6);
  })();

  const columns = compactColumns;

  const filteredRows = search
    ? rows.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      )
    : rows;

  return (
    <section className="w-full min-w-0 space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-500 shrink-0">
              <Database size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Sync Inspector
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Live view of offline storage — dev tool only
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-sm font-medium"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer text-sm font-medium"
            >
              <Trash2 size={16} />
              Clear table
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
        <div className="flex flex-wrap gap-1 border-b border-gray-100 p-2">
          {tableNames.map((name) => (
            <button
              key={name}
              onClick={() => {
                setActiveTable(name);
                setSelectedRow(null);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                activeTable === name
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this table..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading...
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No rows in "{activeTable}".
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 font-semibold text-gray-600 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedRow(row)}
                    className="border-t border-gray-50 hover:bg-orange-50/50 cursor-pointer"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2.5 whitespace-nowrap text-gray-700"
                      >
                        <CellValue column={col} value={row[col]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
          {filteredRows.length} row{filteredRows.length !== 1 ? "s" : ""}
          {search ? ` (filtered from ${rows.length})` : ""}
          {filteredRows.length > 0 && allColumns.length > compactColumns.length
            ? ` · showing ${compactColumns.length} of ${allColumns.length} columns — click a row to view all fields`
            : filteredRows.length > 0
            ? " · click a row to view all fields"
            : ""}
        </div>
      </div>

      <RowDetailModal
        row={selectedRow}
        tableName={activeTable}
        onClose={() => setSelectedRow(null)}
      />

      <ConfirmModal
        open={confirmOpen}
        tableName={activeTable}
        onConfirm={handleClearTable}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
};

export default SyncInspector;