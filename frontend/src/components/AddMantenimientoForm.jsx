import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { postData, putData } from "../utils/api";

const AddMantenimientoForm = () => {
  const navigate = useNavigate();
  const {
    clientes,
    usuario,
    token,
    reLoadClientes,
  } = useAppContext();


  console.log(usuario)

  const [clienteId, setClienteId] = useState("");
  const [instalacionId, setInstalacionId] = useState("");
  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notas, setNotas] = useState("");

  const [instalaciones, setInstalaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar clientes si no están
  useEffect(() => {
    if (!clientes || clientes.length === 0) {
      reLoadClientes();
    }
  }, []);

  // Cuando cambia el cliente → cargar instalaciones
  useEffect(() => {
    if (!clienteId) {
      setInstalaciones([]);
      setInstalacionId("");
      return;
    }

    const cliente = clientes.find(
      (c) => c.id === Number(clienteId)
    );

    setInstalaciones(cliente?.instalaciones || []);
    setInstalacionId("");
  }, [clienteId, clientes]);

  // Util: sumar meses a una fecha
  const sumarMeses = (fechaBase, meses) => {
    const f = new Date(fechaBase);
    f.setMonth(f.getMonth() + meses);
    return f.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId || !instalacionId || !fecha) {
      alert("Completá los campos obligatorios");
      return;
    }

    const instalacion = instalaciones.find(
      (i) => i.id === Number(instalacionId)
    );

    if (!instalacion) {
      alert("Instalación no encontrada");
      return;
    }

    if (!instalacion.frecuencia_meses) {
      alert("La instalación no tiene frecuencia definida");
      return;
    }

    setLoading(true);

    try {
      // calcular próximo mantenimiento según frecuencia
      const proximoMantenimiento = sumarMeses(
        fecha,
        instalacion.frecuencia_meses
      );

      // crear mantenimiento
      await postData(
        "/mantenimientos",
        {
          instalacion_id: Number(instalacionId),
          empresa_id: usuario.empresa_id,
          fecha,
          notas,
          realizado_por: usuario.id,
        },
        token
      );

      // actualizar instalación
      await putData(
        "/instalaciones/" + instalacionId,
        {
          proximo_mantenimiento: proximoMantenimiento,
        },
        token
      );

      navigate("/clientes");
    } catch (error) {
      console.error(error);
      alert("Error al crear el mantenimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto"
    >
      {/* CLIENTE */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Cliente *
        </label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full border rounded px-3 py-2 dark:bg-slate-800"
          required
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* INSTALACIÓN */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Instalación *
        </label>
        <select
          value={instalacionId}
          onChange={(e) => setInstalacionId(e.target.value)}
          className="w-full border rounded px-3 py-2 dark:bg-slate-800"
          disabled={!instalaciones.length}
          required
        >
          <option value="">
            {instalaciones.length
              ? "Seleccionar instalación"
              : "Seleccione un cliente"}
          </option>
          {instalaciones.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.tipo_sistema} · Instalado {inst.fecha_instalacion}
              {" · "}Frecuencia {inst.frecuencia_meses}m
            </option>
          ))}
        </select>
      </div>

      {/* FECHA */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha *
        </label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border rounded px-3 py-2 dark:bg-slate-800"
          required
        />
      </div>

      {/* NOTAS */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Notas
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 dark:bg-slate-800"
          placeholder="Detalles del mantenimiento realizado..."
        />
      </div>

      {/* ACCIONES */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar mantenimiento"}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded border"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default AddMantenimientoForm;
