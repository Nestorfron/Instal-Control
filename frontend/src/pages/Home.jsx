import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, PlusCircle, Building2, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import MapView from "../components/MapView";
import Logo from "../assets/logo.png";
import Logo2 from "../assets/logo-2.png";
import BottomNavbar from "../components/BottomNavbar";

const Home = () => {
  const navigate = useNavigate();
  const { clientes, instalaciones, pendientes } = useAppContext();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("usuario");
    localStorage.removeItem("empresa");
    navigate("/", { replace: true });
  };

  const parseFechaLocal = (fecha) => {
    if (!fecha) return null;
    const [y, m, d] = fecha.split("T")[0].split("-");
    return new Date(y, m - 1, d);
  };
  

  const DIAS_ADELANTE = 30;

  const hoy = parseFechaLocal(
    new Date().toISOString().split("T")[0]
  );
  
  const limite = new Date(hoy);
  limite.setDate(hoy.getDate() + DIAS_ADELANTE);
  

  const instalacionesPendientes = instalaciones.filter((inst) => {
    if (!inst.proximo_mantenimiento) return false;

    const fecha = parseFechaLocal(inst.proximo_mantenimiento);

    return inst.activa && fecha >= hoy && fecha <= limite;
  });

  const totalPendientes = instalacionesPendientes.length + pendientes.length;

  return (
    <div
      className="
        relative min-h-screen pb-28
        bg-gradient-to-br
        from-slate-100 via-white to-slate-200
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
      "
    >
      {/* Glow ambiental */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_45%)]
          dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_50%)]
        "
      />

      {/* LOGOUT
      <button
        onClick={handleLogout}
        className="
          fixed top-4 right-4 z-50
          h-11 w-11 rounded-full
          bg-white/90 dark:bg-slate-800/90
          border border-gray-200 dark:border-slate-700
          flex items-center justify-center
          shadow-md backdrop-blur
          active:scale-95 transition
        "
        title="Salir"
      >
        <LogOut className="h-5 w-5 text-red-600" />
      </button> */}

      {/* HEADER */}
      <header className="relative mb-4">
        <div
          className="
      relative w-full h-28
      bg-gradient-to-r
      from-slate-200 via-slate-100 to-slate-200
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
      overflow-hidden
    "
        >
          {/* Luz ambiental MUY sutil */}
          <div
            className="
        absolute inset-0
        bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_45%)]
        dark:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_50%)]
      "
          />

          {/* Contenido */}
          <div className="relative h-full flex items-center justify-center gap-6">
            <img
              src={Logo}
              alt="Logo principal"
              className="h-20 w-20 object-contain drop-shadow-sm"
            />

            <div className="h-8 w-px bg-slate-400/40 dark:bg-slate-600/40" />

            <img
              src={Logo2}
              alt="Logo secundario"
              className="h-20 w-20 object-contain opacity-80 drop-shadow-sm"
            />
          </div>
        </div>

        {/* Transición */}
        <div
          className="
      absolute bottom-0 left-0 right-0 h-6
      bg-gradient-to-b
      from-transparent to-slate-100
      dark:to-slate-950
    "
        />
      </header>

      {/* ACCIONES PRINCIPALES */}
      <section className="grid grid-cols-2 gap-4 mb-6 relative z-10 px-4">
        {/* Acción principal */}
        <button
          onClick={() => navigate("/mantenimientos/nuevo")}
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
          <Wrench className="h-7 w-7 mb-2 text-blue-600" />
          <span className="text-sm font-medium text-center">
            Nuevo mantenimiento
          </span>
        </button>

        {/* Acción secundaria */}
        <button
          onClick={() => navigate("/lugares/nuevo")}
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
          <PlusCircle className="h-7 w-7 text-emerald-600 mb-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
            Nueva instalación
          </span>
        </button>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-2 gap-3 mb-6 relative z-10 px-4">
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
            label="Pendientes"
            value={totalPendientes}
            color="text-orange-600"
          />
        </button>
      </section>

      {/* MAPA */}
      <section className="mb-4 relative z-10 px-4">
        <div
          className="
            rounded-2xl overflow-hidden
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            shadow-sm
          "
        >
          <MapView lugares={clientes} />
        </div>
      </section>

      <BottomNavbar />
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="
      flex flex-col items-center justify-center
      rounded-2xl
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-slate-700
      py-3
      shadow-sm
      transition
      hover:shadow-md
      active:scale-[0.98]
    "
  >
    <Icon className={`h-5 w-5 mb-1 ${color}`} />
    <span className="text-lg font-semibold text-gray-900 dark:text-white">
      {value}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
  </div>
);

export default Home;
