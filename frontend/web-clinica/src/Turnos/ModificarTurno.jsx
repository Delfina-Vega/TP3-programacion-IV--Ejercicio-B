import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarTurno = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  // Cargar datos
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

  const fetchTurno = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/turnos/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar turno:", data.message);
      return;
    }

    setValues(data.turno);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchTurno();
  }, [fetchTurno]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth(`http://localhost:3000/turnos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400 && data.errores) {
        return setErrores(data.errores);
      }
      return window.alert(data.message || "Error al modificar turno");
    }

    navigate("/turnos");
  };

  if (!values) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Modificar Turno</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Paciente
          <select
            required
            value={values.paciente_id}
            onChange={(e) =>
              setValues({ ...values, paciente_id: e.target.value })
            }
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Médico
          <select
            required
            value={values.medico_id}
            onChange={(e) =>
              setValues({ ...values, medico_id: e.target.value })
            }
          >
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                Dr/a. {m.apellido} - {m.especialidad}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fecha
          <input
            type="date"
            required
            value={values.fecha}
            onChange={(e) => setValues({ ...values, fecha: e.target.value })}
          />
        </label>

        <label>
          Hora
          <input
            type="time"
            required
            value={values.hora}
            onChange={(e) => setValues({ ...values, hora: e.target.value })}
          />
        </label>

        <label>
          Estado
          <select
            required
            value={values.estado}
            onChange={(e) => setValues({ ...values, estado: e.target.value })}
          >
            <option value="pendiente">Pendiente</option>
            <option value="atendido">Atendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </label>

        <label>
          Observaciones
          <textarea
            rows="3"
            value={values.observaciones || ""}
            onChange={(e) =>
              setValues({ ...values, observaciones: e.target.value })
            }
          />
        </label>

        {errores && (
          <small style={{ color: "red" }}>
            {errores.map((e) => e.msg).join(", ")}
          </small>
        )}

        <div className="grid">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/turnos")}
          >
            Cancelar
          </button>
          <button type="submit">Guardar Cambios</button>
        </div>
      </form>
    </article>
  );
};
