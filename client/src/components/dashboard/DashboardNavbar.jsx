import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Search, X } from "lucide-react";
import api from "../../api/axios";

const DashboardNavbar = () => {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const notifications = [
    "Welcome to Sales Task Management",
    "You can manage customers, suppliers and employees",
    "Use global search to find records quickly",
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("pendingOtpEmail");

    navigate("/login", {
      replace: true,
    });
  };

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        const [customerRes, supplierRes, employeeRes] =
          await Promise.all([
            api.get("/customers"),
            api.get("/suppliers"),
            api.get("/employees"),
          ]);

        const customers =
          customerRes.data.customers || [];

        const suppliers =
          supplierRes.data.suppliers || [];

        const employees =
          employeeRes.data.employees || [];

        const searchText = search.toLowerCase();

        const customerResults = customers
          .filter((item) =>
            item.customerName
              ?.toLowerCase()
              .includes(searchText)
          )
          .map((item) => ({
            id: item.id,
            name: item.customerName,
            type: "Customer",
            path: "/people/customers",
          }));

        const supplierResults = suppliers
          .filter((item) =>
            item.supplierName
              ?.toLowerCase()
              .includes(searchText)
          )
          .map((item) => ({
            id: item.id,
            name: item.supplierName,
            type: "Supplier",
            path: "/people/suppliers",
          }));

        const employeeResults = employees
          .filter((item) =>
            item.employeeName
              ?.toLowerCase()
              .includes(searchText)
          )
          .map((item) => ({
            id: item.id,
            name: item.employeeName,
            type: "Employee",
            path: "/people/employees",
          }));

        setResults([
          ...customerResults,
          ...supplierResults,
          ...employeeResults,
        ]);
      } catch (error) {
        setResults([]);
      }
    };

    const timer = setTimeout(fetchSearchData, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleResultClick = (path) => {
    setSearch("");
    setResults([]);
    navigate(path);
  };

  return (
    <header
      className="
      sticky top-0 z-40
      bg-white
      border-b border-gray-200
      px-4 sm:px-6 lg:px-8
      py-4
      shadow-sm
      mt-[64px] lg:mt-0
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Sales Task Management
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 min-w-[260px]">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent ml-2 outline-none text-sm w-full"
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setResults([]);
                }}
                className="cursor-pointer text-gray-400 hover:text-orange-500"
              >
                <X size={16} />
              </button>
            )}

            {results.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                {results.slice(0, 6).map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item.path)}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.type}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
              className="
              relative p-3 rounded-xl
              bg-slate-100
              hover:bg-orange-100
              transition cursor-pointer
              "
            >
              <Bell size={20} className="text-gray-700" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-bold text-gray-800">
                    Notifications
                  </h3>
                </div>

                {notifications.map((note, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 text-sm text-gray-600 border-b last:border-b-0"
                  >
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-sm text-gray-800">
                Admin
              </p>
              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
              T
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="
            flex items-center gap-2
            bg-orange-500 hover:bg-orange-600
            text-white
            px-3 sm:px-4 py-2.5
            rounded-xl
            transition cursor-pointer
            "
          >
            <LogOut size={18} />
            <span className="hidden sm:block">
              Logout
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4 md:hidden">
        <div className="relative flex items-center bg-slate-100 rounded-xl px-3 py-2">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent ml-2 outline-none text-sm w-full"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setResults([]);
              }}
              className="cursor-pointer text-gray-400 hover:text-orange-500"
            >
              <X size={16} />
            </button>
          )}

          {results.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
              {results.slice(0, 6).map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleResultClick(item.path)}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.type}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;