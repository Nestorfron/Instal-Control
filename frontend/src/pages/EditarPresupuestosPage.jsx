import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import EditPresupuestoForm from "../components/EditPresupuestoForm";

export default function EditarPresupuestoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
      <header className="
        sticky top-0 z-10
        flex items-center gap-3
        px-4 py-3
        bg-white dark:bg-slate-800
        border-b dark:border-slate-700
      ">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>

        <div className="flex items-center gap-2">
          <FileText className="text-blue-600" />
          <h1 className="font-semibold">Editar presupuesto</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <EditPresupuestoForm presupuestoId={id} />
      </main>
    </div>
  );
}
