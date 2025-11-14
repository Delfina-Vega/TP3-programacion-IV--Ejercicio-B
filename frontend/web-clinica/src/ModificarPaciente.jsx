import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarPaciente = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);

  const fetchPaciente = useCallback(async () => {
    const response = await fetchAuth(
      `http://localhost:3000/pacientes/${id}`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar paciente:", data.message);
      return;
    }

    setValues(data.paciente);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchPaciente();
  }, [fetchPaciente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth(
      `http://localhost:3000/pacientes/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400 && data.errores) {
        return setErrores(data.errores);
      }
      return window.alert(data.message || "Error al modificar paciente");
    }

    navigate("/pacientes");
  };

  if (!values) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Modificar Paciente</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            required
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
          />
        </label>

        <label>
          Apellido
          <input
            required
            value={values.apellido}
            onChange={(e) =>
              setValues({ ...values, apellido: e.target.value })
            }
          />
        </label>

        <label>
          DNI
          <input
            required
            value={values.dni}
            onChange={(e) => setValues({ ...values, dni: e.target.value })}
          />
        </label>

        <label>
          Fecha de Nacimiento
          <input
            type="date"
            required
            value={values.fecha_nacimiento}
            onChange={(e) =>
              setValues({ ...values, fecha_nacimiento: e.target.value })
            }
          />
        </label>

        <label>
          Obra Social
          <input
            value={values.obra_social || ""}
            onChange={(e) =>
              setValues({ ...values, obra_social: e.target.value })
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
            onClick={() => navigate("/pacientes")}
          >
            Cancelar
          </button>
          <button type="submit">Guardar Cambios</button>
        </div>
      </form>
    </article>
  );
};