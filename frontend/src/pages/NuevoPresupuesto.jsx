import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import AddPresupuestoForm from "../components/AddPresupuestoForm";

export default function NuevoPresupuestoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* HEADER */}
      <header
        className="
          sticky top-0 z-10
          flex items-center gap-3
          px-4 py-3
          bg-white dark:bg-slate-800
          border-b border-gray-200 dark:border-slate-700
          shadow-sm
        "
      >
        <button
          onClick={() => navigate(-1)}
          className="
            p-2 rounded-full
            hover:bg-gray-200 dark:hover:bg-slate-700
            transition
          "
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nuevo presupuesto
          </h1>
        </div>
      </header>

      {/* FORMULARIO */}
      <main className="flex-1 overflow-auto p-4">
        <AddPresupuestoForm />
      </main>
    </div>
  );
}
