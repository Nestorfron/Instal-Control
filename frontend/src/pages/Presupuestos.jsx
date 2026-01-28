import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

/* ======================
   HELPERS
====================== */
const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleDateString("es-UY");
};

const EstadoBadge = ({ estado }) => {
  const base =
    "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border";

  if (estado === "aprobado")
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
        <CheckCircle className="h-3 w-3" />
        Aprobado
      </span>
    );

  if (estado === "rechazado")
    return (
      <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
        <XCircle className="h-3 w-3" />
        Rechazado
      </span>
    );

  return (
    <span className={`${base} bg-slate-100 text-slate-600 border-slate-200`}>
      <Clock className="h-3 w-3" />
      Pendiente
    </span>
  );
};

/* ======================
   COMPONENTE
====================== */
export default function PresupuestosList() {
  const { presupuestos } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4 pb-24 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-slate-600" />
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Presupuestos
        </h1>
      </header>

      {/* LISTADO */}
      {presupuestos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No hay presupuestos todavía</p>
        </div>
      ) : (
        presupuestos.map((p) => (
          <div
            key={p.id}
            className="
              bg-white dark:bg-slate-800
              rounded-2xl
              p-4
              border border-slate-200 dark:border-slate-700
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <div className="flex justify-between items-start gap-4">
              {/* INFO */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {p.tipo_sistema}
                  </p>
                  <EstadoBadge estado={p.estado} />
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cliente:{" "}
                  <span className="font-medium">
                    {p.cliente_nombre ||
                      p.cliente?.nombre ||
                      "Sin cliente"}
                  </span>
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Fecha: {formatearFecha(p.created_at)}
                </p>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Total: ${Number(p.total).toLocaleString("es-UY")}
                </p>
              </div>

              {/* ACCIÓN */}
              <button
                onClick={() => navigate(`/presupuestos/${p.id}`)}
                className="
                  p-2 rounded-full
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  transition
                "
                title="Ver / editar presupuesto"
              >
                <Eye className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
