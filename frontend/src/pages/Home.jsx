import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  PlusCircle,
  CalendarCheck,
  Building2,
  LogOut,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import MapView from "../components/MapView";
import Logo from "../assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const { clientes } = useAppContext();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");
    localStorage.removeItem("empresa");
    navigate("/", { replace: true });
  };


  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-900 px-4 pb-28">
      {/* BOTÓN LOGOUT FLOTANTE */}
      <button
        onClick={handleLogout}
        className="
          fixed top-4 right-4 z-50
          h-11 w-11
          rounded-full
          bg-white dark:bg-slate-800
          border border-gray-200 dark:border-slate-700
          flex items-center justify-center
          shadow-md
          active:scale-95
          transition
        "
        title="Salir"
      >
        <LogOut className="h-5 w-5 text-red-600" />
      </button>

      {/* LOGO / EMPRESA */}
      <header className="pt-6 pb-8 flex flex-col items-center">
        <div
          className="
            
            rounded-full
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            flex items-center justify-center
            shadow-lg
          "
        >
          <img src={Logo} alt="Logo" className="h-16 w-16" />
        </div>

        <span className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
          { "Gestión de Servicios"}
        </span>
      </header>

      {/* ACCIONES PRINCIPALES */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => navigate("/mantenimientos/nuevo")}
          className="
            flex flex-col items-center justify-center
            rounded-2xl
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            p-4
            shadow-sm
            active:scale-95
          "
        >
          <Wrench className="h-7 w-7 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
            Mantenimiento
          </span>
        </button>

        <button
          onClick={() => navigate("/lugares/nuevo")}
          className="
            flex flex-col items-center justify-center
            rounded-2xl
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            p-4
            shadow-sm
            active:scale-95
          "
        >
          <PlusCircle className="h-7 w-7 text-emerald-600 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
            Instalación
          </span>
        </button>
      </section>

      {/* RESUMEN OPERATIVO */}
      <section className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard icon={Building2} label="Clientes" value={clientes.length} />
        <SummaryCard icon={CalendarCheck} label="Hoy" value={3} />
        <SummaryCard icon={Wrench} label="Pendientes" value={3} />
      </section>

      {/* MAPA */}
      <section className="mb-8">
        <MapView lugares={clientes} />
      </section>
    </div>
  );
};

// Componente resumen operativo
const SummaryCard = ({ icon: Icon, label, value }) => (
  <div
    className="
      flex flex-col items-center justify-center
      rounded-2xl
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-slate-700
      py-3
      shadow-sm
    "
  >
    <Icon className="h-5 w-5 text-blue-600 mb-1" />
    <span className="text-lg font-semibold text-gray-900 dark:text-white">
      {value}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {label}
    </span>
  </div>
);

export default Home;
