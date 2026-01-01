import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { putData } from "../utils/api";
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Repeat,
  Save
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function EditarInstalacion() {
  const navigate = useNavigate();
  const { state: instalacion } = useLocation();
  const { clientes, token } = useAppContext();

  if (!instalacion) {
    navigate(-1);
    return null;
  }

  const cliente = useMemo(
    () => clientes.find((c) => c.id === instalacion.cliente_id),
    [clientes, instalacion.cliente_id]
  );

  const [tipoSistema, setTipoSistema] = useState(instalacion.tipo_sistema);
  const [frecuencia, setFrecuencia] = useState(instalacion.frecuencia_meses);
  const [fechaInstalacion, setFechaInstalacion] = useState(
    instalacion.fecha_instalacion
  );
  const [loading, setLoading] = useState(false);

  const sumarMeses = (fecha, meses) => {
    const date = new Date(fecha);
    const diaOriginal = date.getDate();

    date.setMonth(date.getMonth() + meses);

    if (date.getDate() < diaOriginal) {
      date.setDate(0);
    }

    return date.toISOString().split("T")[0];
  };

  const proximoMantenimiento = sumarMeses(
    fechaInstalacion,
    frecuencia
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await putData(
        `/instalaciones/${instalacion.id}`,
        {
          tipo_sistema: tipoSistema,
          frecuencia_meses: frecuencia,
          fecha_instalacion: fechaInstalacion,
          proximo_mantenimiento: proximoMantenimiento
        },
        token
      );

      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-24">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 shadow">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Save className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Editar instalación
          </h1>
        </div>

        {/* Cliente */}
        {cliente && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-6 py-4">
            <p className="font-semibold text-blue-900 dark:text-blue-200">
              {cliente.nombre}
            </p>
            {cliente.direccion && (
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                📍 {cliente.direccion}
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white dark:bg-slate-800 p-5 rounded-xl shadow"
        >
          {/* Tipo sistema */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tipo de sistema
            </label>
            <div className="relative">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={tipoSistema}
                onChange={(e) => setTipoSistema(e.target.value)}
                required
                className="w-full border rounded-lg pl-9 pr-3 py-2
                           dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Fecha de instalación
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={fechaInstalacion}
                onChange={(e) => setFechaInstalacion(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2
                           dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Frecuencia */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Frecuencia de mantenimiento (meses)
            </label>
            <div className="relative">
              <Repeat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min={1}
                value={frecuencia}
                onChange={(e) => setFrecuencia(Number(e.target.value))}
                className="w-full border rounded-lg pl-9 pr-3 py-2
                           dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg
                         disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border rounded-lg py-2
                         dark:border-slate-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
