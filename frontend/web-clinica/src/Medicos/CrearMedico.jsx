import { useState } from "react";
import { useAuth } from "../Auth.jsx";
import { useNavigate } from "react-router-dom";

export const CrearMedico = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);
  const [values, setValues] = useState({
    nombre: "",
    apellido: "",
    especialidad: "",
    matricula: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    const response = await fetchAuth("http://localhost:3000/medicos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400 && data.errores) {
        return setErrores(data.errores);
      }
      return window.alert(data.message || "Error al crear médico");
    }

    navigate("/medicos");
  };

  return (
    <article>
      <h2>Crear Médico</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            required
            value={values.nombre}
            onChange={(e) => setValues({ ...values, nombre: e.target.value })}
            aria-invalid={errores && errores.some((e) => e.path === "nombre")}
          />
          {errores && (
            <small>
              {errores
                .filter((e) => e.path === "nombre")
                .map((e) => e.msg)
                .join(", ")}
            </small>
          )}
        </label>

        <label>
          Apellido
          <input
            required
            value={values.apellido}
            onChange={(e) =>
              setValues({ ...values, apellido: e.target.value })
            }
            aria-invalid={errores && errores.some((e) => e.path === "apellido")}
          />
          {errores && (
            <small>
              {errores
                .filter((e) => e.path === "apellido")
                .map((e) => e.msg)
                .join(", ")}
            </small>
          )}
        </label>

        <label>
          Especialidad
          <input
            required
            value={values.especialidad}
            onChange={(e) =>
              setValues({ ...values, especialidad: e.target.value })
            }
            aria-invalid={
              errores && errores.some((e) => e.path === "especialidad")
            }
          />
          {errores && (
            <small>
              {errores
                .filter((e) => e.path === "especialidad")
                .map((e) => e.msg)
                .join(", ")}
            </small>
          )}
        </label>

        <label>
          Matrícula Profesional
          <input
            required
            value={values.matricula}
            onChange={(e) =>
              setValues({ ...values, matricula: e.target.value })
            }
            aria-invalid={
              errores && errores.some((e) => e.path === "matricula")
            }
          />
          {errores && (
            <small>
              {errores
                .filter((e) => e.path === "matricula")
                .map((e) => e.msg)
                .join(", ")}
            </small>
          )}
        </label>

        <div className="grid">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/medicos")}
          >
            Cancelar
          </button>
          <button type="submit">Crear Médico</button>
        </div>
      </form>
    </article>
  );
};