import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarMedico = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [errores, setErrores] = useState(null);

  const fetchMedico = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/medicos/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar médico:", data.message);
      return;
    }

    setValues(data.medico);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchMedico();
  }, [fetchMedico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth(`http://localhost:3000/medicos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400 && data.errores) {
        return setErrores(data.errores);
      }
      return window.alert(data.message || "Error al modificar médico");
    }

    navigate("/medicos");
  };

  if (!values) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Modificar Médico</h2>
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
          Especialidad
          <input
            required
            value={values.especialidad}
            onChange={(e) =>
              setValues({ ...values, especialidad: e.target.value })
            }
          />
        </label>

        <label>
          Matrícula
          <input
            required
            value={values.matricula}
            onChange={(e) =>
              setValues({ ...values, matricula: e.target.value })
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
            onClick={() => navigate("/medicos")}
          >
            Cancelar
          </button>
          <button type="submit">Guardar Cambios</button>
        </div>
      </form>
    </article>
  );
};