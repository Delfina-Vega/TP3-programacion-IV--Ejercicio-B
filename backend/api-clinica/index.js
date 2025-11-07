import express from "express";
import cors from "cors";
import { conectarDB } from './db.js';
import authRouter, { authConfig } from "./routes/auth.js";

conectarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

authConfig(); 

app.get('/', (req, res) => {
  res.send(" Hola mundo, el servidor esta funcionando y DB conectada!");
});

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});