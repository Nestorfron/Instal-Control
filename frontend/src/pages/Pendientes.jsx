import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import PendienteCard from "../components/PendienteCard";
import BottomNavbar from "../components/BottomNavbar";

const DIAS_ADELANTE = 30;

const Pendientes = () => {
  const navigate = useNavigate();
  const { clientes, instalaciones, pendientes } = useAppContext();

  const [servicios, setServicios] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);

  /* ======================
     FECHAS BASE
  ====================== */
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const limite = new Date(hoy);
  limite.setDate(hoy.getDate() + DIAS_ADELANTE);
  limite.setHours(23, 59, 59, 999);

  const getEstadoFecha = (fecha) => {
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0);

    if (f < hoy) return "pasado";
    if (f.getTime() === hoy.getTime()) return "hoy";
    return "futuro";
  };

  /* ======================
     MAPA CLIENTES
  ====================== */
  const clientesPorId = useMemo(
    () =>
      clientes.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {}),
    [clientes]
  );

  /* ======================
     SERVICIOS
  ====================== */
  useEffect(() => {
    const data = pendientes
      .filter((p) => p.fecha)
      .map((p) => {
        const f = new Date(p.fecha);

        // mostrar pasados + hoy + futuros hasta 30 días
        if (f > limite) return null;

        return {
          ...p,
          cliente: clientesPorId[p.cliente_id],
          tipo: "servicio",
          estadoFecha: getEstadoFecha(p.fecha),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    setServicios(data);
  }, [pendientes, clientesPorId]);

  /* ======================
     MANTENIMIENTOS
  ====================== */
  useEffect(() => {
    const data = instalaciones
      .filter((i) => i.activa && i.proximo_mantenimiento)
      .map((i) => {
        const f = new Date(i.proximo_mantenimiento);

        if (f > limite) return null;

        return {
          id: i.id,
          fecha: i.proximo_mantenimiento,
          cliente_id: i.cliente_id,
          cliente: clientesPorId[i.cliente_id],
          instalacion_id: i.id,
          instalacion: i,
          notas: `Mantenimiento ${i.tipo_sistema}`,
          tipo: "mantenimiento",
          estadoFecha: getEstadoFecha(i.proximo_mantenimiento),
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    setMantenimientos(data);
  }, [instalaciones, clientesPorId]);

  /* ======================
     HANDLER RESUELTO
  ====================== */
  const handleResolved = (id, tipo) => {
    if (tipo === "servicio") {
      setServicios((prev) => prev.filter((p) => p.id !== id));
    } else {
      setMantenimientos((prev) =>
        prev.filter((p) => p.id !== id)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 px-4 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pendientes
        </h1>
      </div>

      {/* SERVICIOS */}
      <div className="space-y-3 bg-white dark:bg-slate-800 border rounded-xl border-gray-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Servicios</h2>

          <button
            onClick={() => navigate("/pendientes/nuevo")}
            className="text-blue-600"
          >
            <PlusCircle className="h-5 w-5" />
          </button>
        </div>

        {servicios.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No hay servicios pendientes
          </p>
        ) : (
          servicios.map((item) => (
            <PendienteCard
              key={item.id}
              item={item}
              onResolved={() =>
                handleResolved(item.id, "servicio")
              }
            />
          ))
        )}
      </div>

      {/* MANTENIMIENTOS */}
      <div className="space-y-3 bg-white dark:bg-slate-800 border rounded-xl border-gray-200 dark:border-slate-700 p-4 shadow-sm mt-3">
        <h2 className="text-lg font-semibold">Mantenimientos</h2>

        {mantenimientos.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No hay mantenimientos pendientes
          </p>
        ) : (
          mantenimientos.map((item) => (
            <PendienteCard
              key={item.id}
              item={item}
              onResolved={() =>
                handleResolved(item.id, "mantenimiento")
              }
            />
          ))
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default Pendientes;
