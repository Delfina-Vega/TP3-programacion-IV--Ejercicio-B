import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Auth";
import { useParams, Link, useNavigate } from "react-router-dom";

export const DetallesTurno = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [turno, setTurno] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [editandoObs, setEditandoObs] = useState(false);

  const fetchTurno = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/turnos/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar turno:", data.message);
      return;
    }

    setTurno(data.turno);
    setObservaciones(data.turno.observaciones || "");
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchTurno();
  }, [fetchTurno]);

  const handleCambiarEstado = async (nuevoEstado) => {
    const response = await fetchAuth(
      `http://localhost:3000/turnos/${id}/estado`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      fetchTurno();
    } else {
      window.alert(data.message || "Error al cambiar estado");
    }
  };

  const handleGuardarObservaciones = async () => {
    const response = await fetchAuth(
      `http://localhost:3000/turnos/${id}/observaciones`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observaciones }),
      }
    );

    const data = await response.json();

    if (response.ok && data.success) {
      setEditandoObs(false);
      fetchTurno();
    } else {
      window.alert(data.message || "Error al guardar observaciones");
    }
  };

  if (!turno) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Detalles del Turno #{turno.id}</h2>

      <h3>Información del Turno</h3>
      <p>
        <strong>Fecha:</strong> {turno.fecha}
      </p>
      <p>
        <strong>Hora:</strong> {turno.hora}
      </p>
      <p>
        <strong>Estado:</strong> {turno.estado}
      </p>

      <h3>Paciente</h3>
      <p>
        <strong>Nombre:</strong> {turno.paciente_apellido},{" "}
        {turno.paciente_nombre}
      </p>
      <p>
        <strong>DNI:</strong> {turno.paciente_dni}
      </p>

      <h3>Médico</h3>
      <p>
        <strong>Nombre:</strong> Dr/a. {turno.medico_apellido},{" "}
        {turno.medico_nombre}
      </p>
      <p>
        <strong>Especialidad:</strong> {turno.medico_especialidad}
      </p>
      <p>
        <strong>Matrícula:</strong> {turno.medico_matricula}
      </p>

      <h3>Observaciones</h3>
      {editandoObs ? (
        <>
          <textarea
            rows="4"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
          <div className="button-group">
            <button onClick={handleGuardarObservaciones}>Guardar</button>
            <button
              className="secondary"
              onClick={() => {
                setEditandoObs(false);
                setObservaciones(turno.observaciones || "");
              }}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <p>{turno.observaciones || "Sin observaciones"}</p>
          <button onClick={() => setEditandoObs(true)}>
            Editar Observaciones
          </button>
        </>
      )}

      <h3>Cambiar Estado</h3>
      <div className="button-group">
        {turno.estado !== "pendiente" && (
          <button
            className="secondary"
            onClick={() => handleCambiarEstado("pendiente")}
          >
            Marcar como Pendiente
          </button>
        )}
        {turno.estado !== "atendido" && (
          <button onClick={() => handleCambiarEstado("atendido")}>
             Marcar como Atendido
          </button>
        )}
        {turno.estado !== "cancelado" && (
          <button
            className="contrast"
            onClick={() => handleCambiarEstado("cancelado")}
          >
            Cancelar Turno
          </button>
        )}
      </div>

      <hr />

      <div className="grid">
        <Link to="/turnos" role="button" className="secondary">
          Volver
        </Link>
        <Link
          to={`/turnos/${id}/modificar`}
          role="button"
          className="contrast"
        >
          Modificar Turno
        </Link>
      </div>
    </article>
  );
};