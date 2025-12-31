import { useEffect, useMemo, useState } from "react";
import { X, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function GlobalSearch({ onClose }) {
  const navigate = useNavigate();
  const { clientes } = useAppContext();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();

    return clientes.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(q) ||
        c.direccion?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [query, clientes]);

  const handleSelect = (cliente) => {
    onClose();
    navigate("/clientes", {
      state: { scrollToClienteId: cliente.id },
    });
  };
  

  return (
    <div className="fixed inset-0 z-[100]">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        />

      {/* PANEL */}
      <div
        className="
          absolute -top-32 left-1/2 -translate-x-1/2
          w-[92%] max-w-lg
          rounded-2xl
          bg-white dark:bg-slate-900
          shadow-2xl
          border border-gray-200 dark:border-slate-700
          animate-in slide-in-from-top-4 fade-in
        "
      >
        {/* INPUT */}
        <div className="flex items-center gap-2 px-4 py-3 border-b dark:border-slate-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente o dirección..."
            className="
              flex-1 bg-transparent outline-none
              text-sm text-gray-900 dark:text-white
            "
          />
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* RESULTADOS */}
        <div className="max-h-72 overflow-auto">
          {!query && (
            <p className="px-4 py-4 text-sm text-gray-500">
              Escribí para buscar clientes
            </p>
          )}

          {query && results.length === 0 && (
            <p className="px-4 py-4 text-sm text-gray-500">
              No se encontraron resultados
            </p>
          )}

          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="
                w-full flex flex-col gap-1
                px-4 py-3 text-left
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition
              "
            >
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {c.nombre}
              </span>

              {c.direccion && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {c.direccion}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
