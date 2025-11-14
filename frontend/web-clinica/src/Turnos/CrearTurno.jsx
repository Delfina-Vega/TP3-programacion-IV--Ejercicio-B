import { useState, useEffect } from "react";
import { useAuth } from "../Auth";
import { useNavigate } from "react-router-dom";

export const CrearTurno = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [values, setValues] = useState({
    paciente_id: "",
    medico_id: "",
    fecha: "",
    hora: "",
    observaciones: "",
  });

  // Cargar pacientes y médicos
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth("http://localhost:3000/turnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400 && data.errores) {
        return setErrores(data.errores);
      }
      return window.alert(data.message || "Error al crear turno");
    }

    navigate("/turnos");
  };

  return (
    <article>
      <h2>Crear Turno</h2>
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
            <option value="">Seleccione un paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre} - DNI: {p.dni}
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
            <option value="">Seleccione un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                Dr/a. {m.apellido}, {m.nombre} - {m.especialidad}
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
          Observaciones (opcional)
          <textarea
            rows="3"
            value={values.observaciones}
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
          <button type="submit">Crear Turno</button>
        </div>
      </form>
    </article>
  );
};