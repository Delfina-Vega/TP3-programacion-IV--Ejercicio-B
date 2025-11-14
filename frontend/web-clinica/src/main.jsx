import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { AuthProvider, AuthPage } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { Ingresar } from "./Login.jsx";
import { Registrar } from "./Registrar.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Ingresar />} />
            <Route path="register" element={<Registrar />} />
            <Route
              path="pacientes"
              element={
                <AuthPage>
                  <div>Pacientes...</div>
                </AuthPage>
              }
            />
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
