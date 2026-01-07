import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { putData, deleteData } from "../utils/api";
import { Search, PlusCircle, Pencil, Trash } from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";

const ClientesPage = () => {
  const { clientes, reLoadClientes, token } = useAppContext();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [editandoInstalacionId, setEditandoInstalacionId] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [loadingInstalacion, setLoadingInstalacion] = useState(false);
  const [instalacionExpandida, setInstalacionExpandida] = useState(null);

  useEffect(() => {
    reLoadClientes();
  }, []);

  /* 🔽 SCROLL DESDE BUSCADOR GLOBAL */
  useEffect(() => {
    if (!location.state?.scrollToClienteId) return;

    const el = document.getElementById(
      `cliente-${location.state.scrollToClienteId}`
    );

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      el.classList.add("ring-2", "ring-blue-500");

      setTimeout(() => {
        el.classList.remove("ring-2", "ring-blue-500");
      }, 2000);
    }
  }, [location.state, clientes]);

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = search.toLowerCase();
    return (
      cliente.nombre?.toLowerCase().includes(texto) ||
      cliente.telefono?.toLowerCase().includes(texto) ||
      cliente.email?.toLowerCase().includes(texto) ||
      cliente.direccion?.toLowerCase().includes(texto)
    );
  });

  const guardarProximoMantenimiento = async (instalacionId) => {
    if (!nuevaFecha) return;

    try {
      setLoadingInstalacion(true);

      await putData(
        `/instalaciones/${instalacionId}`,
        { proximo_mantenimiento: nuevaFecha },
        token
      );

      await reLoadClientes();
      setEditandoInstalacionId(null);
      setNuevaFecha("");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el próximo mantenimiento");
    } finally {
      setLoadingInstalacion(false);
    }
  };

  const handleEliminarMantenimiento = async (id) => {
    try {
      await deleteData(`/mantenimientos/${id}`, token);
      await reLoadClientes();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar mantenimiento");
    }
  };

  return (
    <div className="p-4 pb-24 max-w-6xl mx-auto space-y-6">
      {/* BUSCADOR */}
      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, teléfono, email o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full border rounded pl-9 pr-3 py-2 text-sm
            bg-white dark:bg-slate-800
            text-gray-800 dark:text-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
      </div>

      {/* LISTADO DE CLIENTES */}
      <div className="space-y-6">
        {clientesFiltrados.map((cliente) => (
          <div
            key={cliente.id}
            id={`cliente-${cliente.id}`}
            className="
              rounded-lg border bg-white dark:bg-slate-800
              shadow p-4 transition
            "
          >
            {/* CLIENTE */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4">
              <div>
                <div className="flex justify-between gap-2">
                  <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                    {cliente.nombre}
                  </h2>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/instalaciones/nueva/${cliente.id}`)
                      }
                      title="Agregar instalación"
                    >
                      <PlusCircle className="h-5 w-5 text-blue-600 hover:text-blue-700" />
                    </button>

                    <button
                      onClick={() => navigate(`/cliente/editar/${cliente.id}`)}
                      title="Editar Cliente"
                    >
                      <Pencil className="h-5 w-5 text-blue-600 hover:text-blue-700" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {cliente.telefono && <p>📞 {cliente.telefono}</p>}
                  {cliente.email && <p>✉️ {cliente.email}</p>}
                  {cliente.direccion && <p>📍 {cliente.direccion}</p>}
                </div>
              </div>

              <span
                className={`self-start text-xs px-2 py-1 rounded ${
                  cliente.activo
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {cliente.activo ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* INSTALACIONES */}
            <div className="space-y-4">
              {cliente.instalaciones?.length > 0 ? (
                cliente.instalaciones.map((inst) => {
                  const hoy = new Date();
                  const proximo = inst.proximo_mantenimiento
                    ? new Date(inst.proximo_mantenimiento)
                    : null;
                  const vencido = proximo && proximo < hoy && inst.activa;
                  const expandida = instalacionExpandida === inst.id;

                  return (
                    <div
                      key={inst.id}
                      className={`rounded border p-3 ${
                        vencido
                          ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                          : "bg-gray-50 dark:bg-slate-700"
                      }`}
                    >
                      <div className="flex justify-between flex-wrap gap-2">
                        <p className="font-medium">🛠 {inst.tipo_sistema}</p>

                        <button
                          onClick={() =>
                            navigate(`/instalaciones/${inst.id}/editar`, {
                              state: inst,
                            })
                          }
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Editar Inst.
                        </button>
                      </div>

                      <span className="text-xs text-gray-500">
                        Instalado: {inst.fecha_instalacion}
                      </span>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        🔁 Cada {inst.frecuencia_meses} meses
                      </p>

                      {/* PRÓXIMO MANTENIMIENTO */}
                      <div className="mt-1">
                        {editandoInstalacionId === inst.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="date"
                              value={nuevaFecha}
                              onChange={(e) => setNuevaFecha(e.target.value)}
                              className="border rounded px-2 py-1 text-sm dark:bg-slate-800"
                            />
                            <button
                              onClick={() =>
                                guardarProximoMantenimiento(inst.id)
                              }
                              disabled={loadingInstalacion}
                              className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setEditandoInstalacionId(null);
                                setNuevaFecha("");
                              }}
                              className="text-xs px-2 py-1 rounded border"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          inst.proximo_mantenimiento && (
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm ${
                                  vencido
                                    ? "text-red-600 font-medium"
                                    : "text-gray-600"
                                }`}
                              >
                                ⏭ Próximo: {inst.proximo_mantenimiento}
                              </p>
                              <button
                                onClick={() => {
                                  setEditandoInstalacionId(inst.id);
                                  setNuevaFecha(inst.proximo_mantenimiento);
                                }}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                Editar
                              </button>
                            </div>
                          )
                        )}
                      </div>

                      {/* MANTENIMIENTOS */}
                      <button
                        onClick={() =>
                          setInstalacionExpandida(expandida ? null : inst.id)
                        }
                        className="mt-3 text-xs text-blue-600 hover:underline"
                      >
                        {expandida
                          ? "Ocultar mantenimientos"
                          : "Ver mantenimientos"}
                      </button>

                      {expandida && (
                        <div className="mt-3 space-y-2">
                          {inst.mantenimientos?.length > 0 ? (
                            inst.mantenimientos.map((mant) => (
                              <div
                                key={mant.id}
                                className="rounded border bg-white dark:bg-slate-800 p-2"
                              >
                                <div className="flex justify-between">
                                  <p className="text-sm">📅 {mant.fecha}</p>
                                  <button
                                  onClick={() =>
                                    handleEliminarMantenimiento(mant.id)
                                  }
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  <Trash className="h-5 w-5 text-red-600" />
                                </button>
                                </div>
                              
                                {mant.notas && (
                                  <p className="text-xs text-gray-500">
                                    {mant.notas}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">
                              Sin mantenimientos
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  Sin instalaciones registradas
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default ClientesPage;
