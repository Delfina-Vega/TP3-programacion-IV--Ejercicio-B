import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./Auth";

export const Layout = () => {
    const { isAuthenticated, usuario, logout } = useAuth();

    return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <strong>
              <Link to="/">Gestión de Turnos</Link>
            </strong>
          </li>
        </ul>
        <ul>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/pacientes">Pacientes</Link>
              </li>
              <li>
                <Link to="/medicos">Médicos</Link>
              </li>
              <li>
                <Link to="/turnos">Turnos</Link>
              </li>
              <li>
                <span>{usuario?.nombre}</span>
              </li>
              <li>
                <button onClick={() => logout()} className="secondary">
                  Salir
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Ingresar</Link>
              </li>
              <li>
                <Link to="/register">Registrarse</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <Outlet />
    </main>
  );
};