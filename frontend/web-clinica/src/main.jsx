import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { AuthProvider, AuthPage } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { Login } from "./Login.jsx";
import { Registrar } from "./Registrar.jsx";
import { Pacientes } from "./Pacientes.jsx";
import { CrearPaciente } from "./CrearPaciente.jsx";
import { ModificarPaciente } from "./ModificarPaciente.jsx";
import { DetallesPaciente } from "./DetallesPaciente.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Registrar />} />

            {/* Rutas de Pacientes */}
            <Route
              path="pacientes"
              element={
                <AuthPage>
                  <Pacientes />
                </AuthPage>
              }
            />
            <Route
              path="pacientes/crear"
              element={
                <AuthPage>
                  <CrearPaciente />
                </AuthPage>
              }
            />
            <Route
              path="pacientes/:id"
              element={
                <AuthPage>
                  <DetallesPaciente />
                </AuthPage>
              }
            />
            <Route
              path="pacientes/:id/modificar"
              element={
                <AuthPage>
                  <ModificarPaciente />
                </AuthPage>
              }
            />

            {/* Temporales */}
            <Route
              path="medicos"
              element={
                <AuthPage>
                  <div>Médicos...</div>
                </AuthPage>
              }
            />
            <Route
              path="turnos"
              element={
                <AuthPage>
                  <div>Turnos...</div>
                </AuthPage>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);