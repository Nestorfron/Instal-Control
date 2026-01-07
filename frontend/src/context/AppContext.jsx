import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchData } from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);  
  const [clientes, setClientes] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [pendientes, setPendientes] = useState([]);

  
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const res = await fetchData("/clientes");
        setClientes(res.clientes);
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    const loadInstalaciones = async () => {
      try {
        const res = await fetchData("/instalaciones");
        setInstalaciones(res.instalaciones);
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    const loadPendientes = async () => {
      try {
        const res = await fetchData("/pendientes");
        setPendientes(res.pendientes);
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    loadClientes();
    loadInstalaciones();
    loadPendientes();
  }, []);


  const reLoadClientes = async () => {
    try {
      const res = await fetchData("/clientes");
      setClientes(res.clientes);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  const reLoadInstalaciones = async () => {
    try {
      const res = await fetchData("/instalaciones");
      setInstalaciones(res.instalaciones);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  const reLoadPendientes = async () => {
    try {
      const res = await fetchData("/pendientes");
      setPendientes(res.pendientes);
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        setUsuario,
        token,
        setToken,
        clientes,
        setClientes,
        reLoadClientes,
        instalaciones,
        setInstalaciones,
        reLoadInstalaciones,
        pendientes,
        setPendientes,
        reLoadPendientes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
