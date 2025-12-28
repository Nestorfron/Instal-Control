import React from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, ArrowLeft, User, MapPin, Phone } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import BottomNavbar from "../components/BottomNavbar";

const Pendientes = () => {
  const navigate = useNavigate();
  const { clientes, instalaciones } = useAppContext();

  const DIAS_ADELANTE = 30;

  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + DIAS_ADELANTE);

  // Mapa de clientes por ID
  const clientesPorId = clientes.reduce((acc, cliente) => {
    acc[cliente.id] = cliente;
    return acc;
  }, {});

  // Instalaciones pendientes + cliente
  const pendientes = instalaciones
    .filter((inst) => {
      if (!inst.proximo_mantenimiento) return false;
      const fecha = new Date(inst.proximo_mantenimiento);
      return inst.activa && fecha >= hoy && fecha <= limite;
    })
    .map((inst) => ({
      ...inst,
      cliente: clientesPorId[inst.cliente_id],
    }))
    .sort(
      (a, b) =>
        new Date(a.proximo_mantenimiento) -
        new Date(b.proximo_mantenimiento)
    );

  const diasRestantes = (fecha) => {
    const diff = new Date(fecha) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Próximos mantenimientos
        </h1>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        {pendientes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay mantenimientos próximos
          </p>
        )}

        {pendientes.map((inst) => (
          <div
            key={inst.id}
            className="
              rounded-xl
              bg-white dark:bg-slate-800
              border border-gray-200 dark:border-slate-700
              p-4
              shadow-sm
            "
          >
            {/* Sistema */}
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {inst.tipo_sistema}
              </span>
            </div>

            {/* Cliente */}
            {inst.cliente ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{inst.cliente.nombre}</span>
                </div>

                {inst.cliente.direccion && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{inst.cliente.direccion}</span>
                  </div>
                )}

                {inst.cliente.telefono && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Phone className="h-3 w-3" />
                    <span>{inst.cliente.telefono}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-red-500 mt-2">
                Cliente no encontrado
              </p>
            )}

            {/* Fechas */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Próximo mantenimiento: {inst.proximo_mantenimiento}
              </p>

              <p className="text-sm text-orange-600 mt-1">
                Faltan {diasRestantes(inst.proximo_mantenimiento)} días
              </p>
            </div>
          </div>
        ))}
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Pendientes;
