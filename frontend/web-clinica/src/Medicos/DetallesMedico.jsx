import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../Auth";
import { useParams, Link } from "react-router-dom";

export const DetallesMedico = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const [medico, setMedico] = useState(null);

  const fetchMedico = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/medicos/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar médico:", data.message);
      return;
    }

    setMedico(data.medico);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchMedico();
  }, [fetchMedico]);

  if (!medico) {
    return <p>Cargando...</p>;
  }

  return (
    <article>
      <h2>Detalles del Médico</h2>
      <p>
        <strong>ID:</strong> {medico.id}
      </p>
      <p>
        <strong>Nombre:</strong> {medico.nombre}
      </p>
      <p>
        <strong>Apellido:</strong> {medico.apellido}
      </p>
      <p>
        <strong>Especialidad:</strong> {medico.especialidad}
      </p>
      <p>
        <strong>Matrícula:</strong> {medico.matricula}
      </p>

      <div className="grid">
        <Link to="/medicos" role="button" className="secondary">
          Volver
        </Link>
        <Link
          to={`/medicos/${id}/modificar`}
          role="button"
          className="contrast"
        >
          Modificar
        </Link>
      </div>
    </article>
  );
};