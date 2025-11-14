import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../Auth";
import { Link } from "react-router-dom";

export function Turnos() {
  const { fetchAuth } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [filtros, setFiltros] = useState({
    paciente_id: "",
    medico_id: "",
    fecha: "",
    estado: "",
  });

  // Cargar pacientes y médicos para los filtros
  useEffect(() => {
    const fetchData = async () => {
      const [resPacientes, resMedicos] = await Promise.all([
        fetchAuth("http://localhost:3000/pacientes"),
        fetchAuth("http://localhost:3000/medicos"),
      ]);

      const dataPacientes = await resPacientes.json();
      const dataMedicos = await resMedicos.json();

      if (dataPacientes.success) setPacientes(dataPacientes.pacientes);
      if (dataMedicos.success) setMedicos(dataMedicos.medicos);
    };

    fetchData();
  }, [fetchAuth]);

  const fetchTurnos = useCallback(async () => {
    const searchParams = new URLSearchParams();
    if (filtros.paciente_id) searchParams.append("paciente_id", filtros.paciente_id);
    if (filtros.medico_id) searchParams.append("medico_id", filtros.medico_id);
    if (filtros.fecha) searchParams.append("fecha", filtros.fecha);
    if (filtros.estado) searchParams.append("estado", filtros.estado);

    const query = searchParams.toString();
    const url = `http://localhost:3000/turnos${query ? "?" + query : ""}`;

    const response = await fetchAuth(url);
    const data = await response.json();

    if (response.ok && data.success) {
      setTurnos(data.turnos);
    } else {
      console.error("Error al obtener turnos");
    }
  }, [fetchAuth, filtros]);

  useEffect(() => {
    fetchTurnos();
  }, [fetchTurnos]);

  const handleBuscar = () => {
    fetchTurnos();
  };

  const handleLimpiar = () => {
    setFiltros({ paciente_id: "", medico_id: "", fecha: "", estado: "" });
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Desea eliminar este turno?")) {
      const response = await fetchAuth(`http://localhost:3000/turnos/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchTurnos();
      } else {
        window.alert(data.message || "Error al eliminar turno");
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      pendiente: "Pendiente",
      atendido: "Atendido",
      cancelado: "Cancelado",
    };
    return colors[estado] || "";
  };

  return (
    <article>
      <h2>Turnos</h2>

      <Link to="/turnos/crear" role="button">
        Nuevo Turno
      </Link>

      {/* Filtros */}
      <div className="filters">
        <select
          value={filtros.paciente_id}
          onChange={(e) =>
            setFiltros({ ...filtros, paciente_id: e.target.value })
          }
        >
          <option value="">Todos los pacientes</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.apellido}, {p.nombre}
            </option>
          ))}
        </select>

        <select
          value={filtros.medico_id}
          onChange={(e) =>
            setFiltros({ ...filtros, medico_id: e.target.value })
          }
        >
          <option value="">Todos los médicos</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>
              Dr/a. {m.apellido} - {m.especialidad}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
        />

        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="atendido">Atendido</option>
          <option value="cancelado">Cancelado</option>
        </select>

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
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                No se encontraron turnos
              </td>
            </tr>
          ) : (
            turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  {t.paciente_apellido}, {t.paciente_nombre}
                </td>
                <td>
                  Dr/a. {t.medico_apellido}, {t.medico_nombre}
                </td>
                <td>{t.medico_especialidad}</td>
                <td>{t.fecha}</td>
                <td>{t.hora}</td>
                <td>
                  {getEstadoBadge(t.estado)} {t.estado}
                </td>
                <td>
                  <div className="button-group">
                    <Link
                      to={`/turnos/${t.id}`}
                      role="button"
                      className="secondary"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/turnos/${t.id}/modificar`}
                      role="button"
                      className="contrast"
                    >
                      Modificar
                    </Link>
                    <button onClick={() => handleEliminar(t.id)}>
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