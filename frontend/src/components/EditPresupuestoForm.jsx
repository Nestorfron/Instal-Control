import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { getData, postData, putData, deleteData } from "../utils/api";
import { useAppContext } from "../context/AppContext";

export default function EditPresupuestoForm({ presupuestoId }) {
  const { token } = useAppContext();

  const [presupuesto, setPresupuesto] = useState(null);
  const [componentes, setComponentes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const p = await getData(`/presupuestos/${presupuestoId}`, token);
      const c = await getData(`/componentes?presupuesto_id=${presupuestoId}`, token);

      setPresupuesto(p);
      setComponentes(c);
    };
    fetchData();
  }, []);

  const total = componentes.reduce(
    (acc, c) => acc + c.cantidad * c.precio_unitario,
    0
  );

  const handleChange = (i, field, value) => {
    const copia = [...componentes];
    copia[i][field] = Number.isNaN(Number(value)) ? value : Number(value);
    setComponentes(copia);
  };

  const agregar = () => {
    setComponentes([
      ...componentes,
      { nombre: "", cantidad: 1, precio_unitario: 0, nuevo: true },
    ]);
  };

  const eliminar = async (i) => {
    const c = componentes[i];
    if (c.id) await deleteData(`/componentes/${c.id}`, token);
    setComponentes(componentes.filter((_, index) => index !== i));
  };

  const guardar = async () => {
    await putData(
      `/presupuestos/${presupuestoId}`,
      { total },
      token
    );

    for (const c of componentes) {
      if (c.nuevo) {
        await postData("/componentes", {
          presupuesto_id: presupuestoId,
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: c.precio_unitario,
          subtotal: c.cantidad * c.precio_unitario,
        }, token);
      } else {
        await putData(`/componentes/${c.id}`, {
          nombre: c.nombre,
          cantidad: c.cantidad,
          precio_unitario: c.precio_unitario,
          subtotal: c.cantidad * c.precio_unitario,
        }, token);
      }
    }

    alert("Presupuesto actualizado");
  };

  if (!presupuesto) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <h2 className="font-semibold text-lg">
        {presupuesto.tipo_sistema}
      </h2>

      {componentes.map((c, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <input
            className="col-span-5 border p-2 rounded"
            value={c.nombre}
            onChange={(e) => handleChange(i, "nombre", e.target.value)}
          />
          <input
            type="number"
            className="col-span-2 border p-2 rounded"
            value={c.cantidad}
            min={1}
            onChange={(e) => handleChange(i, "cantidad", e.target.value)}
          />
          <input
            type="number"
            className="col-span-3 border p-2 rounded"
            value={c.precio_unitario}
            min={0}
            onChange={(e) => handleChange(i, "precio_unitario", e.target.value)}
          />
          <button onClick={() => eliminar(i)} className="text-red-500">
            <Trash2 />
          </button>
        </div>
      ))}

      <button
        onClick={agregar}
        className="flex items-center gap-1 text-blue-600"
      >
        <Plus className="h-4 w-4" />
        Agregar componente
      </button>

      <div className="text-right font-semibold">
        Total: ${total}
      </div>

      <button
        onClick={guardar}
        className="w-full bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2"
      >
        <Save />
        Guardar cambios
      </button>
    </div>
  );
}
