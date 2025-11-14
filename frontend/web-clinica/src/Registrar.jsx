import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router-dom";

export const Registrar = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(nombre, email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  if (success) {
    return (
      <article>
        <p style={{ color: "green" }}>
          ✓ Usuario registrado exitosamente. Redirigiendo...
        </p>
      </article>
    );
  }

  return (
    <article>
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <small>Mínimo 8 caracteres, 1 número</small>
        </label>
        {error && <small style={{ color: "red" }}>{error}</small>}
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </article>
  );
};