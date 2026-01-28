import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  PlusCircle,
  Building2,
  FileText,
  List,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import MapView from "../components/MapView";
import Logo from "../assets/logo.png";
import Logo2 from "../assets/logo-2.png";
import BottomNavbar from "../components/BottomNavbar";

const Home = () => {
  const navigate = useNavigate();
  const { clientes, instalaciones, pendientes } = useAppContext();

  /* ======================
     FECHAS
  ====================== */
  const parseFechaLocal = (fecha) => {
    if (!fecha) return null;
    const [y, m, d] = fecha.split("T")[0].split("-");
    return new Date(y, m - 1, d);
  };

  /* ======================
     PENDIENTES 30 DÍAS
  ====================== */
  const DIAS_ADELANTE = 30;

  const hoy = parseFechaLocal(
    new Date().toISOString().split("T")[0]
  );

  const limite = new Date(hoy);
  limite.setDate(hoy.getDate() + DIAS_ADELANTE);

  const entraEnRango = (fecha) => {
    if (!fecha) return false;
    const f = parseFechaLocal(fecha);
    return f <= limite;
  };

  const serviciosEnRango = pendientes.filter(
    (p) => p.fecha && entraEnRango(p.fecha)
  );

  const mantenimientosEnRango = instalaciones.filter((inst) => {
    if (!inst.activa || !inst.proximo_mantenimiento) return false;
    return entraEnRango(inst.proximo_mantenimiento);
  });

  const totalPendientes =
    serviciosEnRango.length + mantenimientosEnRango.length;

  return (
    <div
      className="
        relative min-h-screen pb-28
        bg-gradient-to-br
        from-slate-100 via-white to-slate-200
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
      "
    >
      {/* ======================
         HEADER
      ====================== */}
      <header className="relative mb-4">
        <div className="
          relative w-full h-28
          bg-gradient-to-r
          from-slate-200 via-slate-100 to-slate-200
          dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
          overflow-hidden
        ">
          <div className="relative h-full flex items-center justify-center gap-6">
            <img
              src={Logo}
              alt="Logo"
              className="h-20 w-20 object-contain"
            />

            <div className="h-8 w-px bg-slate-400/40 dark:bg-slate-600/40" />

            <img
              src={Logo2}
              alt="Logo secundario"
              className="h-20 w-20 object-contain opacity-80"
            />
          </div>
        </div>
      </header>

      {/* ======================
         ACCIONES PRINCIPALES
      ====================== */}
      <section className="grid grid-cols-2 gap-4 mb-6 px-4">
        <ActionButton
          icon={Wrench}
          label="Nuevo mantenimiento"
          color="text-blue-600"
          onClick={() => navigate("/mantenimientos/nuevo")}
        />

        <ActionButton
          icon={PlusCircle}
          label="Nueva instalación"
          color="text-emerald-600"
          onClick={() => navigate("/lugares/nuevo")}
        />

        <ActionButton
          icon={FileText}
          label="Nuevo presupuesto"
          color="text-purple-600"
          onClick={() => navigate("/presupuestos/nuevo")}
        />

        <ActionButton
          icon={List}
          label="Presupuestos"
          color="text-indigo-600"
          onClick={() => navigate("/presupuestos")}
        />
      </section>

      {/* ======================
         RESUMEN
      ====================== */}
      <section className="grid grid-cols-2 gap-3 mb-6 px-4">
        <button onClick={() => navigate("/clientes")}>
          <SummaryCard
            icon={Building2}
            label="Clientes"
            value={clientes.length}
            color="text-indigo-600"
          />
        </button>

        <button onClick={() => navigate("/pendientes")}>
          <SummaryCard
            icon={Wrench}
            label="Servicios Pendientes"
            value={totalPendientes}
            color="text-orange-600"
          />
        </button>
      </section>

      {/* ======================
         MAPA
      ====================== */}
      <section className="mb-4 px-4">
        <div className="
          rounded-2xl overflow-hidden
          bg-white dark:bg-slate-800
          border border-gray-200 dark:border-slate-700
          shadow-sm
        ">
          <MapView lugares={clientes} />
        </div>
      </section>

      <BottomNavbar />
    </div>
  );
};

/* ======================
   COMPONENTES
====================== */

const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className="
      flex flex-col items-center justify-center
      rounded-2xl
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-slate-700
      p-4
      shadow-sm
      active:scale-95 transition
    "
  >
    <Icon className={`h-7 w-7 mb-2 ${color}`} />
    <span className="text-sm font-medium text-center">
      {label}
    </span>
  </button>
);

const SummaryCard = ({ icon: Icon, label, value, color }) => (
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
    <Icon className={`h-5 w-5 mb-1 ${color}`} />
    <span className="text-lg font-semibold text-gray-900 dark:text-white">
      {value}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {label}
    </span>
  </div>
);

export default Home;
