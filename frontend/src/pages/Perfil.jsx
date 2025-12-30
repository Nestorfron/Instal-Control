import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";

const Perfil = () => {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const empresa = JSON.parse(localStorage.getItem("empresa"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <div
      className="
        relative min-h-screen px-4 pb-28
        bg-gradient-to-br
        from-slate-100 via-white to-slate-200
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
      "
    >
      {/* Header perfil */}
      <header className="pt-10 pb-6 flex flex-col items-center">
        <div
          className="
            h-24 w-24 rounded-full
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            shadow-lg
            flex items-center justify-center
            mb-4
          "
        >
          <User className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {usuario?.nombre || "Usuario"}
        </h1>
      </header>

      {/* Información */}
      <section className="space-y-3 mb-6">
        <InfoRow icon={Mail} label="Email" value={usuario?.email} />
      </section>

      {/* Acciones */}
      <section className="space-y-3">
        <ActionButton
          icon={Settings}
          label="Configuración"
          onClick={() => navigate("/perfil")}
        />
        <ActionButton
          icon={LogOut}
          label="Cerrar sesión"
          danger
          onClick={handleLogout}
        />
      </section>

      <BottomNavbar />
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div
    className="
      flex items-center gap-3
      rounded-2xl
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-slate-700
      px-4 py-3
      shadow-sm
    "
  >
    <Icon className="h-5 w-5 text-gray-400" />
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value || "-"}
      </span>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3
      rounded-2xl px-4 py-3
      border
      shadow-sm
      transition active:scale-[0.98]
      ${
        danger
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:border-red-800"
          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
      }
    `}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Perfil;
