import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { postData } from "../utils/api";

const tiposSistema = [
  "Alarma",
  "CCTV",
  "Control de acceso",
  "Incendio",
  "Portero eléctrico",
  "Otro",
];

export default function AddPresupuestoForm() {
  const navigate = useNavigate();
  const { usuario, token, clientes } = useAppContext();

  /* ======================
     CLIENTE
  ====================== */
  const [tipoCliente, setTipoCliente] = useState("existente");
  const [clienteId, setClienteId] = useState("");

  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    email: "",
  });

  /* ======================
     PRESUPUESTO
  ====================== */
  const [tipoSistema, setTipoSistema] = useState("");
  const [descripcion, setDescripcion] = useState("");

  /* ======================
     COMPONENTES
  ====================== */
  const [componentes, setComponentes] = useState([
    { nombre: "", cantidad: 1, precio: 0 },
  ]);

  const total = componentes.reduce(
    (acc, c) => acc + c.cantidad * c.precio,
    0
  );

  /* ======================
     LIMPIEZA AL CAMBIAR TIPO CLIENTE
  ====================== */
  useEffect(() => {
    if (tipoCliente === "existente") {
      setClienteNuevo({
        nombre: "",
        telefono: "",
        direccion: "",
        email: "",
      });
    } else {
      setClienteId("");
    }
  }, [tipoCliente]);

  /* ======================
     HANDLERS COMPONENTES
  ====================== */
  const handleComponenteChange = (index, field, value) => {
    const copia = [...componentes];
    copia[index][field] =
      field === "cantidad" || field === "precio"
        ? Number(value)
        : value;
    setComponentes(copia);
  };

  const agregarComponente = () => {
    setComponentes([
      ...componentes,
      { nombre: "", cantidad: 1, precio: 0 },
    ]);
  };

  const eliminarComponente = (index) => {
    if (componentes.length === 1) return;
    setComponentes(componentes.filter((_, i) => i !== index));
  };

  /* ======================
     GUARDAR PRESUPUESTO
  ====================== */
  const guardarPresupuesto = async () => {
    if (!tipoSistema) {
      alert("Seleccioná el tipo de sistema");
      return;
    }

    if (tipoCliente === "existente" && !clienteId) {
      alert("Seleccioná un cliente");
      return;
    }

    if (tipoCliente === "nuevo" && !clienteNuevo.nombre.trim()) {
      alert("El nombre del cliente es obligatorio");
      return;
    }

    if (componentes.some((c) => !c.nombre || c.cantidad <= 0)) {
      alert("Revisá los componentes");
      return;
    }

    try {
      /* 1️⃣ Presupuesto */
      const presupuesto = await postData(
        "/presupuestos",
        {
          empresa_id: usuario.empresa_id,
          cliente_id:
            tipoCliente === "existente" ? clienteId : null,

          cliente_nombre:
            tipoCliente === "nuevo" ? clienteNuevo.nombre : null,
          cliente_telefono:
            tipoCliente === "nuevo" ? clienteNuevo.telefono : null,
          cliente_direccion:
            tipoCliente === "nuevo" ? clienteNuevo.direccion : null,
          cliente_email:
            tipoCliente === "nuevo" ? clienteNuevo.email : null,

          tipo_sistema: tipoSistema,
          descripcion,
          total,
          estado: "pendiente",
          creado_por: usuario.id,
        },
        token
      );

      /* 2️⃣ Componentes */
      for (const c of componentes) {
        await postData(
          "/componentes",
          {
            presupuesto_id: presupuesto.id,
            nombre: c.nombre,
            cantidad: c.cantidad,
            precio_unitario: c.precio,
            subtotal: c.cantidad * c.precio,
          },
          token
        );
      }

      navigate("/presupuestos");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el presupuesto");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* CLIENTE */}
      <section className="rounded-2xl border bg-white dark:bg-slate-800 p-4 space-y-4">
        <h2 className="font-semibold">Cliente</h2>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={tipoCliente === "existente"}
              onChange={() => setTipoCliente("existente")}
            />
            Existente
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={tipoCliente === "nuevo"}
              onChange={() => setTipoCliente("nuevo")}
            />
            Nuevo
          </label>
        </div>

        {tipoCliente === "existente" && (
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded-lg border p-2"
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}

        {tipoCliente === "nuevo" && (
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border p-2"
              placeholder="Nombre del cliente *"
              value={clienteNuevo.nombre}
              onChange={(e) =>
                setClienteNuevo({
                  ...clienteNuevo,
                  nombre: e.target.value,
                })
              }
            />

            <input
              className="w-full rounded-lg border p-2"
              placeholder="Teléfono"
              value={clienteNuevo.telefono}
              onChange={(e) =>
                setClienteNuevo({
                  ...clienteNuevo,
                  telefono: e.target.value,
                })
              }
            />

            <input
              className="w-full rounded-lg border p-2"
              placeholder="Dirección"
              value={clienteNuevo.direccion}
              onChange={(e) =>
                setClienteNuevo({
                  ...clienteNuevo,
                  direccion: e.target.value,
                })
              }
            />

            <input
              type="email"
              className="w-full rounded-lg border p-2"
              placeholder="Email"
              value={clienteNuevo.email}
              onChange={(e) =>
                setClienteNuevo({
                  ...clienteNuevo,
                  email: e.target.value,
                })
              }
            />
          </div>
        )}
      </section>

      {/* SISTEMA */}
      <section className="rounded-2xl border bg-white dark:bg-slate-800 p-4 space-y-3">
        <h2 className="font-semibold">Sistema</h2>

        <select
          value={tipoSistema}
          onChange={(e) => setTipoSistema(e.target.value)}
          className="w-full rounded-lg border p-2"
        >
          <option value="">Tipo de sistema</option>
          {tiposSistema.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <textarea
          rows={3}
          className="w-full rounded-lg border p-2"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </section>

      {/* COMPONENTES */}
      <section className="rounded-2xl border bg-white dark:bg-slate-800 p-4 space-y-4">
        <div className="flex justify-between">
          <h2 className="font-semibold">Componentes</h2>
          <button
            onClick={agregarComponente}
            className="text-blue-600 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>

        {componentes.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              className="col-span-5 border p-2 rounded"
              placeholder="Componente"
              value={c.nombre}
              onChange={(e) =>
                handleComponenteChange(i, "nombre", e.target.value)
              }
            />
            <input
              type="number"
              className="col-span-2 border p-2 rounded"
              min={1}
              value={c.cantidad}
              onChange={(e) =>
                handleComponenteChange(i, "cantidad", e.target.value)
              }
            />
            <input
              type="number"
              className="col-span-3 border p-2 rounded"
              min={0}
              value={c.precio}
              onChange={(e) =>
                handleComponenteChange(i, "precio", e.target.value)
              }
            />
            <button
              onClick={() => eliminarComponente(i)}
              className="col-span-2 text-red-500 flex justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <div className="text-right text-lg font-semibold">
        Total: ${total.toLocaleString("es-UY")}
      </div>

      <button
        onClick={guardarPresupuesto}
        className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
      >
        <Save className="h-5 w-5" />
        Guardar presupuesto
      </button>
    </div>
  );
}
