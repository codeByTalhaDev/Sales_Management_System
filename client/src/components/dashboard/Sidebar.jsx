import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  User,
  Truck,
  Briefcase,
  ChevronDown,
  Package,
  Ruler,
  Tags,
  Box,
  Warehouse,
  List,
  AlertTriangle,
  CalendarClock,
  ShoppingCart,
  FileText,
  PlusCircle,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openPeople, setOpenPeople] = useState(false);
  const [openCatalog, setOpenCatalog] = useState(false);
  const [openStock, setOpenStock] = useState(false);
  const [openPurchase, setOpenPurchase] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/people")) {
      setOpenPeople(true);
    }

    if (location.pathname.startsWith("/catalog")) {
      setOpenCatalog(true);
    }
    if (location.pathname.startsWith("/stock")) {
      setOpenStock(true);
    }
    if (location.pathname.startsWith("/purchase")) {
      setOpenPurchase(true);
    }
  }, [location.pathname]);

  const goToPage = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const mainButtonClass = (path) =>
    `
    w-full flex items-center gap-3
    px-4 py-3 rounded-xl
    text-sm sm:text-base font-medium
    transition-all cursor-pointer
    ${
      location.pathname === path
        ? "bg-orange-500 text-white shadow-md"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
    }
  `;

  const subButtonClass = (path) =>
    `
    w-full flex items-center gap-2
    px-3 py-2.5 rounded-lg
    text-sm font-medium
    transition-all cursor-pointer
    ${
      location.pathname === path
        ? "bg-orange-500 text-white"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
    }
  `;

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex justify-between items-center z-50 shadow-sm">
        <div>
          <h1 className="font-bold text-gray-800">Sales App</h1>
          <p className="text-xs text-gray-500">Management System</p>
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-orange-50 cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
    fixed lg:sticky
    top-0 left-0 z-50
    h-screen
    w-72 sm:w-80 lg:w-64
    shrink-0
    bg-white
    border-r border-gray-200
    px-4 py-5
    transition-all duration-300 ease-in-out
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    overflow-y-auto
  `}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sales App</h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 cursor-pointer"
          >
            <X />
          </button>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => goToPage("/dashboard")}
            className={mainButtonClass("/dashboard")}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <div>
            <button
              onClick={() => setOpenPeople(!openPeople)}
              className={`
              w-full flex justify-between items-center
              px-4 py-3 rounded-xl transition-all cursor-pointer
              ${
                location.pathname.startsWith("/people")
                  ? "bg-orange-50 text-orange-500"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }
              `}
            >
              <div className="flex gap-3">
                <Users size={20} />
                People
              </div>

              <ChevronDown
                className={`transition-transform ${
                  openPeople ? "rotate-180" : ""
                }`}
              />
            </button>

            {openPeople && (
              <div className="ml-5 mt-2 pl-3 border-l border-gray-200 space-y-2">
                <button
                  onClick={() => goToPage("/people/customers")}
                  className={subButtonClass("/people/customers")}
                >
                  <User size={18} />
                  Customers
                </button>

                <button
                  onClick={() => goToPage("/people/suppliers")}
                  className={subButtonClass("/people/suppliers")}
                >
                  <Truck size={18} />
                  Suppliers
                </button>

                <button
                  onClick={() => goToPage("/people/employees")}
                  className={subButtonClass("/people/employees")}
                >
                  <Briefcase size={18} />
                  Employees
                </button>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => setOpenCatalog(!openCatalog)}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all cursor-pointer ${location.pathname.startsWith("/catalog") ? "bg-orange-50 text-orange-500" : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              <div className="flex gap-3">
                <Package size={20} />
                Catalog
              </div>

              <ChevronDown
                className={`transition-transform${openCatalog ? "rotate-180" : ""}`}
              />
            </button>

            {openCatalog && (
              <div className="ml-5 mt-2 pl-3 border-l border-gray-200 space-y-2">
                <button
                  onClick={() => goToPage("/catalog/uom")}
                  className={subButtonClass("/catalog/uom")}
                >
                  <Ruler size={18} />
                  UOM
                </button>
                <button
                  onClick={() => goToPage("/catalog/category")}
                  className={subButtonClass("/catalog/category")}
                >
                  <Tags size={18} />
                  Category
                </button>
                <button
                  onClick={() => goToPage("/catalog/products")}
                  className={subButtonClass("/catalog/products")}
                >
                  <Box size={18} />
                  Products
                </button>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => setOpenStock(!openStock)}
              className={`
      w-full flex justify-between items-center
      px-4 py-3 rounded-xl transition-all cursor-pointer
      ${
        location.pathname.startsWith("/stock")
          ? "bg-orange-50 text-orange-500"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      }
    `}
            >
              <div className="flex gap-3">
                <Warehouse size={20} />
                Stock
              </div>

              <ChevronDown
                className={`transition-transform ${
                  openStock ? "rotate-180" : ""
                }`}
              />
            </button>

            {openStock && (
              <div className="ml-5 mt-2 pl-3 border-l border-gray-200 space-y-2">
                <button
                  onClick={() => goToPage("/stock/list")}
                  className={subButtonClass("/stock/list")}
                >
                  <List size={18} />
                  Stock List
                </button>

                <button
                  onClick={() => goToPage("/stock/reorder")}
                  className={subButtonClass("/stock/reorder")}
                >
                  <AlertTriangle size={18} />
                  Reorder List
                </button>

                <button
                  onClick={() => goToPage("/stock/expiry")}
                  className={subButtonClass("/stock/expiry")}
                >
                  <CalendarClock size={18} />
                  Expiry List
                </button>
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => setOpenPurchase(!openPurchase)}
              className={`
      w-full flex justify-between items-center
      px-4 py-3 rounded-xl transition-all cursor-pointer
      ${
        location.pathname.startsWith("/purchase")
          ? "bg-orange-50 text-orange-500"
          : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
      }
    `}
            >
              <div className="flex gap-3">
                <ShoppingCart size={20} />
                Purchase
              </div>

              <ChevronDown
                className={`transition-transform ${
                  openPurchase ? "rotate-180" : ""
                }`}
              />
            </button>

            {openPurchase && (
              <div className="ml-5 mt-2 pl-3 border-l border-gray-200 space-y-2">
                <button
                  onClick={() => goToPage("/purchase/add")}
                  className={subButtonClass("/purchase/add")}
                >
                  <PlusCircle size={18} />
                  Add Purchase
                </button>
                <button
                  onClick={() => goToPage("/purchase/list")}
                  className={subButtonClass("/purchase/list")}
                >
                  <FileText size={18} />
                  Purchase List
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
