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

import { Pacientes } from "./Pacientes/Pacientes.jsx";
import { CrearPaciente } from "./Pacientes/CrearPaciente.jsx";
import { ModificarPaciente } from "./Pacientes/ModificarPaciente.jsx";
import { DetallesPaciente } from "./Pacientes/DetallesPaciente.jsx";

import { Medicos } from "./Medicos/Medicos.jsx";
import { CrearMedico } from "./Medicos/CrearMedico.jsx";
import { ModificarMedico } from "./Medicos/ModificarMedico.jsx";
import { DetallesMedico } from "./Medicos/DetallesMedico.jsx";

import { Turnos } from "./Turnos/Turnos.jsx";
import { CrearTurno } from "./Turnos/CrearTurno.jsx";
import { ModificarTurno } from "./Turnos/ModificarTurno.jsx";
import { DetallesTurno } from "./Turnos/DetallesTurno.jsx";
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

            {/*Rutas de Medicos*/}
            <Route
              path="medicos"
              element={
                <AuthPage>
                  <Medicos />
                </AuthPage>
              }
            />
            <Route
              path="medicos/crear"
              element={
                <AuthPage>
                  <CrearMedico />
                </AuthPage>
              }
            />
            <Route
              path="medicos/:id"
              element={
                <AuthPage>
                  <DetallesMedico />
                </AuthPage>
              }
            />
            <Route
              path="medicos/:id/modificar"
              element={
                <AuthPage>
                  <ModificarMedico />
                </AuthPage>
              }
            />
            
            <Route
              path="turnos"
              element={
                <AuthPage>
                  <Turnos />
                </AuthPage>
              }
            />
            <Route
              path="turnos/crear"
              element={
                <AuthPage>
                  <CrearTurno />
                </AuthPage>
              }
            />
            <Route
              path="turnos/:id"
              element={
                <AuthPage>
                  <DetallesTurno />
                </AuthPage>
              }
            />
            <Route
              path="turnos/:id/modificar"
              element={
                <AuthPage>
                  <ModificarTurno />
                </AuthPage>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);