import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import AddMantenimientoForm from "../components/AddMantenimientoForm";

export default function NuevoMantenimientoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="flex items-center px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        <h1 className="ml-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Nuevo Mantenimiento
        </h1>
      </header>

      {/* FORMULARIO */}
      <main className="flex-1 overflow-auto p-4">
        <AddMantenimientoForm />
      </main>
    </div>
  );
}
