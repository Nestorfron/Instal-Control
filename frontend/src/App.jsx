import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NuevoLugarPage from "./pages/NuevoLugarPage";
import ClientesPage from "./pages/Clientes";
import NuevoMantenimientoPage from "./pages/NuevoMantenimientoPage";
import Pendientes from "./pages/Pendientes";
import NuevaInstalacion from "./pages/NuevaInstalacion";


function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateSW, setUpdateSW] = useState(() => () => {});

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log("App lista para funcionar offline 🚀");
      },
    });

    setUpdateSW(() => updateServiceWorker);
  }, []);

  const handleUpdate = () => {
    updateSW();
    setUpdateAvailable(false);
    window.location.reload();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/lugares/nuevo" element={<NuevoLugarPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/mantenimientos/nuevo" element={<NuevoMantenimientoPage />} />
          <Route path="/pendientes" element={<Pendientes />} />
          <Route path="/instalaciones/nueva/:clienteId" element={<NuevaInstalacion />} />
        </Routes>
      </BrowserRouter>

      {updateAvailable && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#333",
            color: "#fff",
            padding: "1rem",
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          🔄 Nueva versión disponible.&nbsp;
          <button
            onClick={handleUpdate}
            style={{
              cursor: "pointer",
              background: "#fff",
              color: "#333",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
            }}
          >
            Actualizar
          </button>
        </div>
      )}
    </>
  );
}

export default App;
