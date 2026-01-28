import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { fetchData, postData, putData, deleteData } from "../utils/api";

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [presupuesto, setPresupuesto] = useState(null);
  const [componentes, setComponentes] = useState([]);
  /* ======================
     CARGA DE DATOS
  ====================== */
  useEffect(() => {
    const cargar = async () => {
      try {
        const p = await fetchData(`/presupuestos/${id}`, token);
        const c = await fetchData(
          `/componentes?presupuesto_id=${id}`,
          token
        );

        setPresupuesto(p);
        setComponentes(Array.isArray(c) ? c : []); // ✅ blindaje
      } catch (err) {
        console.error(err);
        alert("Error al cargar el presupuesto");
        navigate("/presupuestos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id, token, navigate]);

  /* ======================
     HELPERS
  ====================== */
  const total = (componentes || []).reduce(
    (acc, c) =>
      acc +
      (Number(c.cantidad) || 0) *
      (Number(c.precio_unitario) || 0),
    0
  );

  const handleComponenteChange = (index, field, value) => {
    setComponentes((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        [field]:
          field === "cantidad" || field === "precio_unitario"
            ? Number(value)
            : value,
      };
      return copia;
    });
  };

  const agregarComponente = () => {
    setComponentes((prev) => [
      ...prev,
      { nombre: "", cantidad: 1, precio_unitario: 0 },
    ]);
  };

  const eliminarComponente = async (index) => {
    const c = componentes[index];

    try {
      if (c?.id) {
        await deleteData(`/componentes/${c.id}`, token);
      }

      setComponentes((prev) =>
        prev.filter((_, i) => i !== index)
      );
    } catch (err) {
      alert("Error al eliminar componente");
    }
  };

  /* ======================
     GUARDAR
  ====================== */
  const guardarCambios = async () => {
    try {
      await putData(
        `/presupuestos/${id}`,
        {
          tipo_sistema: presupuesto.tipo_sistema,
          descripcion: presupuesto.descripcion,
          total,
        },
        token
      );

      for (const c of componentes) {
        const payload = {
          presupuesto_id: id,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: c.precio_unitario,
          subtotal: c.cantidad * c.precio_unitario,
        };

        if (c.id) {
          await putData(`/componentes/${c.id}`, payload, token);
        } else {
          await postData("/componentes", payload, token);
        }
      }

      alert("Presupuesto actualizado");
      navigate("/presupuestos");
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios");
    }
  };

  /* ======================
     ESTADO
  ====================== */
  const cambiarEstado = async (estado) => {
    try {
      await putData(
        `/presupuestos/${id}`,
        { estado },
        token
      );
      setPresupuesto((p) => ({ ...p, estado }));
    } catch {
      alert("Error al cambiar estado");
    }
  };

  if (loading || !presupuesto) return null;

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="font-semibold">Presupuesto</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* CLIENTE */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
          <p className="text-sm text-gray-500">Cliente</p>
          <p className="font-semibold">
            {presupuesto.cliente_nombre ||
              presupuesto.cliente?.nombre ||
              "Sin cliente"}
          </p>
        </section>

        {/* DATOS */}
        <section className="space-y-3">
          <input
            className="w-full rounded-lg border p-2"
            value={presupuesto.tipo_sistema || ""}
            onChange={(e) =>
              setPresupuesto({
                ...presupuesto,
                tipo_sistema: e.target.value,
              })
            }
          />

          <textarea
            rows={3}
            className="w-full rounded-lg border p-2"
            value={presupuesto.descripcion || ""}
            onChange={(e) =>
              setPresupuesto({
                ...presupuesto,
                descripcion: e.target.value,
              })
            }
          />
        </section>

        {/* COMPONENTES */}
        <section className="space-y-3">
          <div className="flex justify-between">
            <h2 className="font-semibold">Componentes</h2>
            <button
              onClick={agregarComponente}
              className="text-blue-600 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>

          {componentes.map((c, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className="col-span-5 border p-2 rounded"
                value={c.nombre || ""}
                onChange={(e) =>
                  handleComponenteChange(i, "nombre", e.target.value)
                }
              />
              <input
                type="number"
                className="col-span-2 border p-2 rounded"
                value={c.cantidad}
                onChange={(e) =>
                  handleComponenteChange(i, "cantidad", e.target.value)
                }
              />
              <input
                type="number"
                className="col-span-3 border p-2 rounded"
                value={c.precio_unitario}
                onChange={(e) =>
                  handleComponenteChange(
                    i,
                    "precio_unitario",
                    e.target.value
                  )
                }
              />
              <button
                onClick={() => eliminarComponente(i)}
                className="col-span-2 text-red-500"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </section>

        {/* TOTAL */}
        <div className="text-right font-semibold">
          Total: ${total.toLocaleString("es-UY")}
        </div>

        {/* ACCIONES */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={guardarCambios}
            className="bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            Guardar
          </button>

          {presupuesto.estado !== "aprobado" && (
            <button
              onClick={() => cambiarEstado("aprobado")}
              className="bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle />
              Aprobar
            </button>
          )}

          {presupuesto.estado !== "rechazado" && (
            <button
              onClick={() => cambiarEstado("rechazado")}
              className="bg-red-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 col-span-2"
            >
              <XCircle />
              Rechazar
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
