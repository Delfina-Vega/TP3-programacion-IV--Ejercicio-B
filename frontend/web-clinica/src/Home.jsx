import { Link } from "react-router-dom";
import { useAuth } from "./Auth";

export const Home = () => {
  const { isAuthenticated, usuario } = useAuth();

  return (
    <article>
      <hgroup>
        <h1>Sistema de Gestión de Turnos Médicos</h1>
      </hgroup>

      {isAuthenticated ? (
        <div>
         <h2>¡Bienvenido/a, {usuario?.nombre}! </h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>
              Seleccione una opción para comenzar a operar
            </p>
          <div className="grid">
            <Link to="/pacientes" role="button">
              Pacientes
            </Link>
            <Link to="/medicos" role="button" className="secondary">
              Médicos
            </Link>
            <Link to="/turnos" role="button" className="contrast">
              Turnos
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p>Inicia sesión para acceder al sistema</p>
          <Link to="/login" role="button">
            Iniciar sesión
          </Link>
        </div>
      )}
    </article>
  );
};