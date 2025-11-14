import { children } from "react";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
     const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario") || "null")
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
        localStorage.setItem("token", token);
    } else {
        localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (usuario) {
        localStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
        localStorage.removeItem("usuario");
    }
  },  [usuario]);
  const register = async (nombre, email, password) => {
    setError(null);
    try {
        const response = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }), 
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al registrarse");
        }

        return { success: true };
    } catch (err) {
        setError(err.message);
        return { success: false, error: err.message};
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales invalidas");
      }

      setToken(data.token);
      setUsuario(data.usuario);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setError(null);
  };

  const fetchAuth = async (url, options = {}) => {
    if (!token) {
        throw new Error("No autenticado");
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
  };

  return (
     <AuthContext.Provider
      value={{
        token,
        usuario,
        error,
        isAuthenticated: !!token,
        register,
        login,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <h2>Ingrese para ver esta página</h2>;
  }
  return children;
};
