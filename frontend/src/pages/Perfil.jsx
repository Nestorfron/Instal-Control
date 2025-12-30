import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";
import { putData } from "../utils/api";

/* ===================== */
/*  PERFIL COMPONENT    */
/* ===================== */

const Perfil = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  /* ---------- LOGOUT ---------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  /* ---------- PASSWORD STRENGTH ---------- */
  const passwordRules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
  };

  const isPasswordStrong = Object.values(passwordRules).every(Boolean);

  /* ---------- CHANGE PASSWORD ---------- */
  const handleChangePassword = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa todos los campos");
      return;
    }

    if (!isPasswordStrong) {
      setError("La contraseña no es lo suficientemente segura");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await putData(
        `/usuarios/${usuario.id}/password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        token
      );

      setToast("Contraseña actualizada. Volvé a iniciar sesión.");
      setTimeout(handleLogout, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al cambiar contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 pb-28 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* TOAST */}
      {toast && <Toast message={toast} />}

      {/* HEADER */}
      <header className="pt-10 pb-6 flex flex-col items-center">
        <div className="h-24 w-24 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {usuario?.nombre || "Usuario"}
        </h1>
      </header>

      {/* INFO */}
      <section className="space-y-3 mb-6">
        <InfoRow icon={Mail} label="Email" value={usuario?.email} />
      </section>

      {/* ACTIONS */}
      <section className="space-y-3">
        <ActionButton
          icon={Lock}
          label="Cambiar contraseña"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        />

        {/* COLLAPSE */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showPasswordForm ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 space-y-3 shadow-sm">
            <PasswordInput
              label="Contraseña actual"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
            />

            <PasswordInput
              label="Nueva contraseña"
              value={newPassword}
              onChange={setNewPassword}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
            />

            <PasswordInput
              label="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
            />

            <PasswordStrength rules={passwordRules} />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 rounded-xl py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>

              <button
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 rounded-xl py-2 border border-gray-300 dark:border-slate-600 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <ActionButton
          icon={LogOut}
          label="Cerrar sesión"
          danger
          onClick={handleLogout}
        />
      </section>

      <BottomNavbar />
    </div>
  );
};

/* ===================== */
/*  COMPONENTS          */
/* ===================== */

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-3 shadow-sm">
    <Icon className="h-5 w-5 text-gray-400" />
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {value || "-"}
      </p>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 border shadow-sm transition active:scale-[0.98]
      ${
        danger
          ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800"
          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
      }
    `}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const PasswordInput = ({ label, value, onChange, show, toggle }) => (
  <div className="flex flex-col gap-1 relative">
    <label className="text-xs text-gray-500">{label}</label>
    <input
      type={show ? "text" : "password"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
    />
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-7 text-gray-400"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
);

const PasswordStrength = ({ rules }) => (
  <div className="space-y-1 text-xs">
    <Rule ok={rules.length} label="Al menos 8 caracteres" />
    <Rule ok={rules.upper} label="Una mayúscula" />
    <Rule ok={rules.lower} label="Una minúscula" />
    <Rule ok={rules.number} label="Un número" />
  </div>
);

const Rule = ({ ok, label }) => (
  <div className={`flex items-center gap-1 ${ok ? "text-green-600" : "text-gray-400"}`}>
    {ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
    <span>{label}</span>
  </div>
);

const Toast = ({ message }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm shadow-lg animate-in fade-in slide-in-from-top-2">
    {message}
  </div>
);

export default Perfil;
