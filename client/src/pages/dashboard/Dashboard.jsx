import {
  Users,
  Truck,
  Briefcase,
  Package,
  AlertTriangle,
  CalendarClock,
  Plus,
  Activity,
  Clock,
  UserPlus,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    employees: 0,
    products: 0,
    lowStock: 0,
    expiryProducts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/stats");

        setStats({
          customers: res.data.customers || 0,
          suppliers: res.data.suppliers || 0,
          employees: res.data.employees || 0,
          products: res.data.products || 0,
          lowStock: res.data.lowStock || 0,
          expiryProducts: res.data.expiryProducts || 0,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Customers",
      value: stats.customers,
      icon: <Users size={26} />,
      text: "Total active customers",
    },
    {
      title: "Suppliers",
      value: stats.suppliers,
      icon: <Truck size={26} />,
      text: "Total active suppliers",
    },
    {
      title: "Employees",
      value: stats.employees,
      icon: <Briefcase size={26} />,
      text: "Total active employees",
    },
    {
      title: "Products",
      value: stats.products,
      icon: <Package size={26} />,
      text: "Total active products",
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: <AlertTriangle size={26} />,
      text: "Products need reorder",
    },
    {
      title: "Expiry Products",
      value: stats.expiryProducts,
      icon: <CalendarClock size={26} />,
      text: "Products with expiry date",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="mt-2 text-orange-100 max-w-2xl">
          Manage customers, suppliers, employees, products and stock professionally.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {loading ? "..." : card.value}
                </h2>

                <p className="text-gray-400 text-xs mt-2">
                  {card.text}
                </p>
              </div>

              <div className="bg-orange-100 text-orange-500 p-4 rounded-xl">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/people/customers"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <UserPlus size={18} />
              Add Customer
            </Link>

            <Link
              to="/catalog/products"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus size={18} />
              Add Product
            </Link>

            <Link
              to="/stock/reorder"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <AlertTriangle size={18} />
              Reorder List
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-xl mb-5">
            Live Tracking
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-500">
                <Activity />
              </div>

              <div>
                <p className="font-semibold">
                  Total Records
                </p>

                <p className="text-sm text-gray-500">
                  {stats.customers +
                    stats.suppliers +
                    stats.employees +
                    stats.products}{" "}
                  active records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-500">
                <Clock />
              </div>

              <div>
                <p className="font-semibold">
                  Stock Alerts
                </p>

                <p className="text-sm text-gray-500">
                  {stats.lowStock} products need reorder
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-500">
                <CalendarClock />
              </div>

              <div>
                <p className="font-semibold">
                  Expiry Tracking
                </p>

                <p className="text-sm text-gray-500">
                  {stats.expiryProducts} expiry products found
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}