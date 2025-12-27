import { useState, useEffect } from "react";
import MapSelector from "./MapSelector";
import { useAppContext } from "../context/AppContext";
import { postData, fetchData } from "../utils/api";

export default function AddLugarForm({ clientes = [] }) {
  const { usuario, token } = useAppContext();
  const [form, setForm] = useState({
    empresa_id: "",
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
    tipo_sistema: "",
    fecha_instalacion: "",
    frecuencia_meses: 6,
    proximo_mantenimiento: "",
  });
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  // Obtener posición inicial del usuario
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error obteniendo ubicación:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      setMessage("Debes seleccionar la ubicación en el mapa");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Crear cliente
      const clienteData = {
        empresa_id: usuario.empresa_id,
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccion: form.direccion,
        observaciones: form.observaciones,
        lat: position[0],
        lng: position[1],
      };
      const clienteRes = await postData("/clientes", clienteData, token); // <-- pasamos token
      if (!clienteRes?.cliente) throw new Error("Error creando cliente");

      // Crear instalación si hay datos
      if (form.tipo_sistema && form.fecha_instalacion) {
        const instalacionData = {
          empresa_id: usuario.empresa_id,
          cliente_id: clienteRes.cliente.id,
          instalador_id: usuario.id,
          tipo_sistema: form.tipo_sistema,
          fecha_instalacion: form.fecha_instalacion,
          frecuencia_meses: form.frecuencia_meses,
          proximo_mantenimiento: form.proximo_mantenimiento || null,
        };
        await postData("/instalaciones", instalacionData, token); // <-- token también aquí
      }

      setMessage("Lugar agregado correctamente");
      setForm({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        observaciones: "",
        tipo_sistema: "",
        fecha_instalacion: "",
        frecuencia_meses: 6,
        proximo_mantenimiento: "",
      });
      setPosition(null);
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error al guardar");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20">
      <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Nombre del cliente / lugar"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
        required
      />
      <input
        name="telefono"
        value={form.telefono}
        onChange={handleChange}
        placeholder="Teléfono"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />
      <input
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        placeholder="Dirección"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />
      <textarea
        name="observaciones"
        value={form.observaciones}
        onChange={handleChange}
        placeholder="Observaciones"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />

      <input
        name="tipo_sistema"
        value={form.tipo_sistema}
        onChange={handleChange}
        placeholder="Tipo de sistema (opcional)"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />
      <input
        type="date"
        name="fecha_instalacion"
        value={form.fecha_instalacion}
        onChange={handleChange}
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />
      <input
        type="number"
        name="frecuencia_meses"
        value={form.frecuencia_meses}
        onChange={handleChange}
        placeholder="Frecuencia en meses"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
        min={1}
      />
      <input
        type="date"
        name="proximo_mantenimiento"
        value={form.proximo_mantenimiento}
        onChange={handleChange}
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />

      <MapSelector position={position} setPosition={setPosition} clientes={clientes} />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded py-3 shadow"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Agregar lugar"}
      </button>

    </form>
  );
}
