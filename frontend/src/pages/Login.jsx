import React, { useState } from "react";
import { loginUser, postData } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Logo from "../assets/logo.png";
import Logo2 from "../assets/logo-2.png";

const LoginSetup = () => {
  const navigate = useNavigate();
  const { setUsuario, setToken } = useAppContext();

  const [modoSetup, setModoSetup] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (modoSetup) {
        await postData("/auth/setup", {
          name: form.nombre,
          email: form.correo,
          password: form.password,
        });
      }

      const data = await loginUser(form.correo, form.password);

      setToken(data.access_token || data.token);
      setUsuario(data.usuario || null);

      localStorage.setItem("token", data.access_token || data.token);
      if (data.usuario) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
      }

      navigate("/home");
    } catch (err) {
      setError(err.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-[100dvh]
        bg-gray-50 dark:bg-slate-900
        flex items-center justify-center
        px-4
        overflow-x-hidden
      "
    >
      <div
        className="
          w-full max-w-sm
          bg-white dark:bg-slate-800
          rounded-2xl
          p-6
          shadow-sm
          border border-gray-200 dark:border-slate-700
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex items-center gap-4 mb-2">
            <img src={Logo} alt="Logo" className="h-14 w-14" />
            <img src={Logo2} alt="Logo secundario" className="h-14 w-14" />
          </div>

          <h1 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            {modoSetup ? "Crear administrador" : "Iniciar sesión"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modoSetup && (
            <Input
              icon={User}
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          )}

          <Input
            icon={Mail}
            name="correo"
            type="text"
            placeholder="Correo / Usuario"
            value={form.correo}
            onChange={handleChange}
          />

          <Input
            icon={Lock}
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl
              bg-blue-600 text-white
              py-2 font-medium
              transition active:scale-95
              disabled:opacity-60
            "
          >
            {loading
              ? "Procesando..."
              : modoSetup
              ? "Crear administrador"
              : "Ingresar"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setModoSetup(!modoSetup)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            {modoSetup
              ? "Ya existe un administrador"
              : "Configurar administrador inicial"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ icon: Icon, ...props }) => (
  <div
    className="
      flex items-center gap-2
      border border-gray-200 dark:border-slate-700
      rounded-xl
      px-3 py-2
      bg-white dark:bg-slate-900
      box-border
    "
  >
    <Icon className="h-4 w-4 text-gray-400 shrink-0" />
    <input
      className="
        w-full
        bg-transparent
        outline-none
        text-sm
        text-gray-900 dark:text-white
        box-border
      "
      {...props}
    />
  </div>
);

export default LoginSetup;
