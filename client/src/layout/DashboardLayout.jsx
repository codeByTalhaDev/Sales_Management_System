import Sidebar from "../components/dashboard/Sidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

import { Outlet, useNavigate, useLocation } from "react-router-dom";

import { useEffect } from "react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="
      min-h-screen
      bg-slate-50
      lg:flex
      "
    >
      {/* Sidebar */}

      <Sidebar />

      {/* Content */}

      <div
        className="
        flex-1
        flex
        flex-col
        min-h-screen
        "
      >
        {/* Navbar */}

        <DashboardNavbar />

        {/* Main */}

        <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-8 overflow-x-hidden">
          <Outlet />
        </main>

        {/* Footer */}

        <footer
          className="
          bg-white

          border-t
          border-gray-200

          px-4
          sm:px-6
          lg:px-8

          py-5

          shadow-sm
          "
        >
          <div
            className="
            flex

            flex-col
            md:flex-row

            items-center

            justify-between

            gap-3
            "
          >
            <div>
              <h3
                className="
                font-bold
                text-gray-800
                "
              >
                Sales Task Management
              </h3>

              <p
                className="
                text-sm
                text-gray-500
                "
              >
                Professional sales management dashboard
              </p>
            </div>

            <div
              className="
              text-sm
              text-gray-500
              "
            >
              © {new Date().getFullYear()} All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
