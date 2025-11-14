import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Auth";
import { Link } from "react-router-dom";

export function Medicos() {
  const { fetchAuth } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
  });

  const fetchMedicos = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (filtros.nombre) searchParams.append("nombre", filtros.nombre);
    if (filtros.apellido) searchParams.append("apellido", filtros.apellido);
    if (filtros.especialidad) searchParams.append("especialidad", filtros.especialidad);

    const query = searchParams.toString();
    const url = `http://localhost:3000/medicos${query ? "?" + query : ""}`;

    const response = await fetchAuth(url);
    const data = await response.json();

    if (response.ok && data.success) {
      setMedicos(data.medicos);
    } else {
      console.error("Error al obtener médicos");
    }
  }, [fetchAuth, filtros]);

  useEffect(() => {
    fetchMedicos();
  }, [fetchMedicos]);

  const handleBuscar = () => {
    fetchMedicos();
  };

  const handleLimpiar = () => {
    setFiltros({ nombre: "", apellido: "", especialidad: "" });
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar este médico?")) {
      const response = await fetchAuth(
        `http://localhost:3000/medicos/${id}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        fetchMedicos();
      } else {
        window.alert(data.message || "Error al eliminar médico");
      }
    }
  };

  return (
    <article>
      <h2>Médicos</h2>

      <Link to="/medicos/crear" role="button">
        Nuevo Médico
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
          placeholder="Especialidad"
          value={filtros.especialidad}
          onChange={(e) =>
            setFiltros({ ...filtros, especialidad: e.target.value })
          }
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
            <th>Especialidad</th>
            <th>Matrícula</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No se encontraron médicos
              </td>
            </tr>
          ) : (
            medicos.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.nombre}</td>
                <td>{m.apellido}</td>
                <td>{m.especialidad}</td>
                <td>{m.matricula}</td>
                <td>
                  <div className="button-group">
                    <Link
                      to={`/medicos/${m.id}`}
                      role="button"
                      className="secondary"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/medicos/${m.id}/modificar`}
                      role="button"
                      className="contrast"
                    >
                      Modificar
                    </Link>
                    <button onClick={() => handleEliminar(m.id)}>
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