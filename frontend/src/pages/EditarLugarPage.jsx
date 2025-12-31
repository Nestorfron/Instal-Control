import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import EditClienteForm from "../components/EditClienteForm";

export default function EditarLugarPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clientes } = useAppContext();

  const cliente = clientes.find((c) => String(c.id) === String(id));

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

        <h1 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
          Editar Lugar
        </h1>
      </header>

      {/* FORMULARIO */}
      <main className="flex-1 overflow-auto p-4">
        {cliente ? (
          <EditClienteForm
            cliente={cliente}
            onSuccess={() => navigate(-1)}
          />
        ) : (
          <p className="text-center text-sm text-gray-500">
            Cargando cliente...
          </p>
        )}
      </main>
    </div>
  );
}
