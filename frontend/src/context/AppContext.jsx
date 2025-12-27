import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchData } from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);  
  const [clientes, setClientes] = useState([]);

  
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const res = await fetchData("/clientes");
        setClientes(res.clientes);
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    loadClientes();
  }, []);

  return (
    <AppContext.Provider
      value={{
        usuario,
        setUsuario,
        token,
        setToken,
        clientes,
        setClientes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
