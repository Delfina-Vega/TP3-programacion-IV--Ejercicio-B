import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useParams, Link } from "react-router-dom";

export const DetallesPaciente = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);

  const fetchPaciente = useCallback(async () => {
    const response = await fetchAuth(
      `http://localhost:3000/pacientes/${id}`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar paciente:", data.message);
      return;
    }

    setPaciente(data.paciente);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchPaciente();
  }, [fetchPaciente]);

  if (!paciente) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Detalles del Paciente</h2>
      <p>
        <strong>ID:</strong> {paciente.id}
      </p>
      <p>
        <strong>Nombre:</strong> {paciente.nombre}
      </p>
      <p>
        <strong>Apellido:</strong> {paciente.apellido}
      </p>
      <p>
        <strong>DNI:</strong> {paciente.dni}
      </p>
      <p>
        <strong>Fecha de Nacimiento:</strong> {paciente.fecha_nacimiento}
      </p>
      <p>
        <strong>Obra Social:</strong> {paciente.obra_social || "No especificada"}
      </p>

      <div className="grid">
        <Link to="/pacientes" role="button" className="secondary">
          Volver
        </Link>
        <Link
          to={`/pacientes/${id}/modificar`}
          role="button"
          className="contrast"
        >
          Modificar
        </Link>
      </div>
    </article>
  );
};