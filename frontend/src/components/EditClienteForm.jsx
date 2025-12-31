import { useState, useEffect } from "react";
import MapSelector from "./MapSelector";
import { useAppContext } from "../context/AppContext";
import { putData } from "../utils/api";

export default function EditClienteForm({ cliente, onSuccess }) {
  const { usuario, token, reLoadClientes } = useAppContext();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
  });

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* 🔄 cargar datos iniciales */
  useEffect(() => {
    if (!cliente) return;

    setForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      observaciones: cliente.observaciones || "",
    });

    if (cliente.lat && cliente.lng) {
      setPosition([cliente.lat, cliente.lng]);
    }
  }, [cliente]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!position) {
      setMessage("Selecciona la ubicación en el mapa");
      return;
    }

    setLoading(true);

    try {
      const clientePayload = {
        empresa_id: usuario.empresa_id,
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
        observaciones: form.observaciones,
        lat: position[0],
        lng: position[1],
      };

      await putData(`/clientes/${cliente.id}`, clientePayload, token);

      setMessage("Cliente actualizado correctamente");
      reLoadClientes();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setMessage("Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20">
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre del cliente"
        className="w-full border rounded-xl px-3 py-2 dark:bg-slate-700"
        required
      />

      <input
        name="telefono"
        value={form.telefono}
        onChange={handleChange}
        placeholder="Teléfono"
        className="w-full border rounded-xl px-3 py-2 dark:bg-slate-700"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full border rounded-xl px-3 py-2 dark:bg-slate-700"
      />

      <input
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        placeholder="Dirección"
        className="w-full border rounded-xl px-3 py-2 dark:bg-slate-700"
      />

      <textarea
        name="observaciones"
        value={form.observaciones}
        onChange={handleChange}
        placeholder="Observaciones"
        className="w-full border rounded-xl px-3 py-2 dark:bg-slate-700"
      />

      <MapSelector
        position={position}
        setPosition={setPosition}
        clientes={[]}
      />

      {/* MENSAJE MEJORADO */}
      {message && (
        <div
          className="
            rounded-xl px-4 py-2
            bg-blue-50 dark:bg-slate-800
            border border-blue-200 dark:border-slate-700
            text-sm text-blue-700 dark:text-slate-200
            text-center
            shadow-sm
            animate-in fade-in slide-in-from-top-2
          "
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          w-full rounded-xl py-3
          bg-blue-600 text-white
          font-medium
          shadow
          hover:bg-blue-700
          disabled:opacity-50
        "
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
