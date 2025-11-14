import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Auth";
import { Link } from "react-router-dom";

export function Pacientes() {
  const { fetchAuth } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    dni: "",
  });

  const fetchPacientes = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (filtros.nombre) searchParams.append("nombre", filtros.nombre);
    if (filtros.apellido) searchParams.append("apellido", filtros.apellido);
    if (filtros.dni) searchParams.append("dni", filtros.dni);

    const query = searchParams.toString();
    const url = `http://localhost:3000/pacientes${query ? "?" + query : ""}`;

    const response = await fetchAuth(url);
    const data = await response.json();

    if (response.ok && data.success) {
      setPacientes(data.pacientes);
    } else {
      console.error("Error al obtener pacientes");
    }
  }, [fetchAuth, filtros]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleBuscar = () => {
    fetchPacientes();
  };

  const handleLimpiar = () => {
    setFiltros({ nombre: "", apellido: "", dni: "" });
  };const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar este paciente?")) {
      const response = await fetchAuth(
        `http://localhost:3000/pacientes/${id}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        fetchPacientes();
      } else {
        window.alert(data.message || "Error al eliminar paciente");
      }
    }
  };

  return (
    <article>
      <h2>Pacientes</h2>

      <Link to="/pacientes/crear" role="button">
        Nuevo Paciente
      </Link>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Nombre"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
        />
        <input
          type="text"
          placeholder="Apellido"
          value={filtros.apellido}
          onChange={(e) =>
            setFiltros({ ...filtros, apellido: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="DNI"
          value={filtros.dni}
          onChange={(e) => setFiltros({ ...filtros, dni: e.target.value })}
        />
        <button onClick={handleBuscar}>Buscar</button>
        <button onClick={handleLimpiar} className="secondary">
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Fecha Nac.</th>
            <th>Obra Social</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No se encontraron pacientes
              </td>
            </tr>
          ) : (
            pacientes.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.dni}</td>
                <td>{p.fecha_nacimiento}</td>
                <td>{p.obra_social || "-"}</td>
                <td>
                  <div className="button-group">
                    <Link
                      to={`/pacientes/${p.id}`}
                      role="button"
                      className="secondary"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/pacientes/${p.id}/modificar`}
                      role="button"
                      className="contrast"
                    >
                      Modificar
                    </Link>
                    <button onClick={() => handleEliminar(p.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </article>
  );
}