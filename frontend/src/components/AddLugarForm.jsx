import { useState, useEffect } from "react";
import MapSelector from "./MapSelector";
import { useAppContext } from "../context/AppContext";
import { postData, putData } from "../utils/api";

export default function AddLugarForm({
  clientes = [],
  lugar = null,
  modo = "create",
}) {
  const { usuario, token, reLoadClientes } = useAppContext();
  const isEdit = modo === "edit";

  const hoy = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    observaciones: "",
    tipo_sistema: "",
    fecha_instalacion: hoy,
    frecuencia_meses: "",
    proximo_mantenimiento: "",
  });

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===============================
     PRECARGAR DATOS (EDITAR)
  =============================== */
  useEffect(() => {
    if (isEdit && lugar) {
      setForm({
        nombre: lugar.nombre || "",
        telefono: lugar.telefono || "",
        email: lugar.email || "",
        direccion: lugar.direccion || "",
        observaciones: lugar.observaciones || "",
        tipo_sistema: lugar.instalacion?.tipo_sistema || "",
        fecha_instalacion: lugar.instalacion?.fecha_instalacion || hoy,
        frecuencia_meses: lugar.instalacion?.frecuencia_meses || "",
        proximo_mantenimiento:
          lugar.instalacion?.proximo_mantenimiento || "",
      });

      if (lugar.lat && lugar.lng) {
        setPosition([lugar.lat, lugar.lng]);
      }
    }
  }, [isEdit, lugar, hoy]);

  /* ===============================
     CALCULAR PRÓXIMO MANTENIMIENTO
  =============================== */
  useEffect(() => {
    if (!form.fecha_instalacion || !form.frecuencia_meses) return;

    const fecha = new Date(form.fecha_instalacion);
    fecha.setMonth(fecha.getMonth() + Number(form.frecuencia_meses));

    setForm((prev) => ({
      ...prev,
      proximo_mantenimiento: fecha.toISOString().split("T")[0],
    }));
  }, [form.fecha_instalacion, form.frecuencia_meses]);

  /* ===============================
     GEOLOCALIZACIÓN (SOLO CREATE)
  =============================== */
  useEffect(() => {
    if (isEdit) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Error obteniendo ubicación", err),
      { enableHighAccuracy: true }
    );
  }, [isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!position) {
      setMessage("Debes seleccionar la ubicación en el mapa");
      return;
    }

    setLoading(true);
    setMessage("");

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

      if (isEdit) {
        await putData(`/clientes/${lugar.id}`, clientePayload, token);
      } else {
        const clienteRes = await postData(
          "/clientes",
          clientePayload,
          token
        );

        if (!clienteRes?.cliente) {
          throw new Error("Error creando cliente");
        }

        if (form.tipo_sistema && form.fecha_instalacion) {
          await postData(
            "/instalaciones",
            {
              empresa_id: usuario.empresa_id,
              cliente_id: clienteRes.cliente.id,
              instalador_id: usuario.id,
              tipo_sistema: form.tipo_sistema,
              fecha_instalacion: form.fecha_instalacion,
              frecuencia_meses: form.frecuencia_meses,
              proximo_mantenimiento:
                form.proximo_mantenimiento || null,
            },
            token
          );
        }
      }

      setMessage(
        isEdit
          ? "Lugar actualizado correctamente"
          : "Lugar agregado correctamente"
      );
      reLoadClientes();
    } catch (err) {
      console.error(err);
      setMessage("Ocurrió un error al guardar");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20 m-2">
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
        placeholder="Tipo de sistema"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm">Fecha inst.</span>
        <input
          type="date"
          name="fecha_instalacion"
          value={form.fecha_instalacion}
          onChange={handleChange}
          className="flex-1 border rounded px-2 py-1 dark:bg-slate-700"
        />
      </div>

      <input
        type="number"
        name="frecuencia_meses"
        value={form.frecuencia_meses}
        onChange={handleChange}
        placeholder="Frecuencia (meses)"
        className="w-full border rounded px-2 py-1 dark:bg-slate-700"
        min={1}
      />

      <div className="flex items-center gap-3">
        <span className="text-sm">Próx. Mant.</span>
        <input
          type="date"
          value={form.proximo_mantenimiento}
          readOnly
          className="flex-1 border rounded px-2 py-1 bg-gray-100 dark:bg-slate-600"
        />
      </div>

      <MapSelector
        position={position}
        setPosition={setPosition}
        clientes={clientes}
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full text-white rounded py-3 shadow transition ${
          isEdit ? "bg-emerald-600" : "bg-blue-600"
        }`}
      >
        {loading
          ? "Guardando..."
          : isEdit
          ? "Guardar cambios"
          : "Agregar lugar"}
      </button>

      {message && (
  <div
    className="
      flex items-center gap-2
      rounded-xl px-4 py-2
      bg-blue-50 dark:bg-slate-800
      border border-blue-200 dark:border-slate-700
      text-sm
      text-blue-700 dark:text-slate-200
      shadow-sm
      animate-in fade-in slide-in-from-top-2
    "
  >
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9 12h2V8H9v4zm0 4h2v-2H9v2zm1-14C4.935 2 2 4.935 2 8s2.935 6 7 6 7-2.935 7-6-2.935-6-7-6z" />
    </svg>

    <span>{message}</span>
  </div>
)}

    </form>
  );
}
