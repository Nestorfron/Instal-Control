import React from "react";
import {
  Home,
  Building2,
  Wrench,
  Bell,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "home", icon: Home, path: "/home", label: "Inicio" },
    {
      key: "clientes",
      icon: Building2,
      path: "/clientes",
      label: "Clientes",
    },
    {
      key: "pendientes",
      icon: Wrench,
      path: "/pendientes",
      label: "Pendientes",
    },
    { key: "perfil", icon: User, path: "#", label: "Perfil" },
  ];

  return (
    <>
      {/* BOTTOM NAV */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white dark:bg-slate-900
          border-t border-gray-200 dark:border-slate-800
          shadow-lg pb-6
        "
      >
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center w-16"
              >
                <div
                  className={`
                    relative p-2 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                    }
                  `}
                >
                  <Icon size={24} />
                </div>

                <span
                  className={`mt-1 text-[11px] font-medium ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* FOOTER */}
      <footer className="pt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          GSP — desarrollado por{" "}
          <a
            href="https://github.com/nestorfron"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400"
          >
            Nestor Frones
          </a>
        </p>
        <p>Todos los derechos reservados — © 2025</p>
      </footer>
    </>
  );
};

export default BottomNavbar;
