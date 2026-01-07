import React, { useState } from "react";
import { User, MapPin, Phone, Check } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { postData, deleteData, putData } from "../utils/api";

/* ======================
   HELPERS FECHA (SIN TIMEZONE BUG)
====================== */
const parseFechaLocal = (fecha) => {
  if (!fecha) return null;
  const [y, m, d] = fecha.split("-");
  return new Date(y, m - 1, d);
};

const formatearFecha = (fecha) => {
  const f = parseFechaLocal(fecha);
  return f ? f.toLocaleDateString("es-UY") : "";
};

const diasRestantes = (fecha) => {
  const f = parseFechaLocal(fecha);
  if (!f) return 0;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diff = f.getTime() - hoy.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

/* ======================
   COMPONENTE
====================== */
const PendienteCard = ({ item, onResolved }) => {
  const { usuario, token } = useAppContext();
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const cliente = item.cliente;
  const dias = diasRestantes(item.fecha);

  const handleResolver = async () => {
    if (!window.confirm("¿Marcar como realizado?")) return;

    setLoading(true);

    try {
      /* 1️⃣ Crear mantenimiento realizado */
      await postData(
        "/mantenimientos",
        {
          empresa_id: usuario.empresa_id,
          cliente_id: item.cliente_id,
          instalacion_id: item.instalacion_id,
          fecha: item.fecha,
          notas: item.notas,
          realizado_por: usuario.id,
        },
        token
      );

      /* 2️⃣ Si es mantenimiento → actualizar próximo */
      if (
        item.tipo === "mantenimiento" &&
        item.instalacion?.frecuencia_meses
      ) {
        const f = parseFechaLocal(item.fecha);
        f.setMonth(f.getMonth() + item.instalacion.frecuencia_meses);

        await putData(
          `/instalaciones/${item.instalacion_id}`,
          {
            proximo_mantenimiento: f
              .toISOString()
              .split("T")[0],
          },
          token
        );
      }

      /* 3️⃣ SOLO si es servicio → borrar pendiente */
      if (item.tipo === "servicio") {
        await deleteData(`/pendientes/${item.id}`, token);
      }

      /* 4️⃣ Avisar al padre */
      onResolved?.(item.id);
    } catch (error) {
      console.error(error);
      alert("Error al marcar como realizado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* CLIENTE */}
      {cliente ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <User className="h-4 w-4 text-blue-600" />
            <span>{cliente.nombre}</span>

            <button
              onClick={handleResolver}
              disabled={loading}
              className="ml-auto rounded-full p-1 hover:bg-green-100 dark:hover:bg-green-900/30 transition disabled:opacity-50"
              title="Marcar como realizado"
            >
              <Check className="h-6 w-6 text-green-600" />
            </button>
          </div>

          {(cliente.direccion || cliente.telefono) && (
            <div className="pl-6 space-y-0.5">
              {cliente.direccion && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{cliente.direccion}</span>
                </div>
              )}

              {cliente.telefono && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="h-3 w-3" />
                  <span>{cliente.telefono}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-red-500">Cliente no encontrado</p>
      )}

      {/* DIVISOR */}
      <div className="my-3 border-t border-gray-100 dark:border-slate-700" />

      {/* NOTAS */}
      {item.notas && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {item.notas}
        </p>
      )}

      {/* FOOTER */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatearFecha(item.fecha)}
        </span>

        <span
          className={`
            text-xs font-semibold px-2 py-0.5 rounded-full
            ${
              dias < 0
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                : dias === 0
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : dias <= 2
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300"
            }
          `}
        >
          {dias < 0
            ? "Vencido"
            : dias === 0
            ? "Hoy"
            : `Faltan ${dias} días`}
        </span>
      </div>
    </div>
  );
};

export default PendienteCard;
