import React from "react";
import {
  Home,
  Building2,
  Wrench,
  User,
  Plus,
  Search,
  CheckCircle,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { icon: Home, path: "/home" },
    { icon: Building2, path: "/clientes" },
    { spacer: true },
    { icon: Wrench, path: "/pendientes" },
    { icon: User, path: "/perfil" },
  ];

  const centerActions = {
    "/home": {
      icon: Search,
      action: () => console.log("Buscar"),
    },
    "/clientes": {
      icon: Plus,
      action: () => navigate("/clientes/nuevo"),
    },
    "/pendientes": {
      icon: CheckCircle,
      action: () => console.log("Resolver pendientes"),
    },
    "/perfil": {
      icon: Settings,
      action: () => navigate("/perfil"),
    },
  };

  const center = centerActions[location.pathname];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="
          relative flex items-center gap-5 px-6 py-3
          rounded-2xl
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-md
          shadow-xl border border-gray-200/50 dark:border-slate-700/50
        "
      >
        {items.map((item, index) => {
          if (item.spacer) return <div key={index} className="w-10" />;

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="
                group flex items-center justify-center
                w-10 h-10 rounded-xl
                transition-all duration-200
              "
            >
              <Icon
                size={24}
                className={`
                  transition-all
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 scale-110"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-blue-500"
                  }
                `}
              />
            </button>
          );
        })}

        {/* BOTÓN CENTRAL */}
        {center && (
          <button
            onClick={center.action}
            className="
              absolute -top-4 left-1/2 -translate-x-1/2
              w-14 h-14 rounded-2xl
              bg-blue-600 hover:bg-blue-700
              dark:bg-blue-500 dark:hover:bg-blue-600
              text-white
              shadow-xl
              flex items-center justify-center
              transition-transform active:scale-95
            "
          >
            <center.icon size={28} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNavbar;
