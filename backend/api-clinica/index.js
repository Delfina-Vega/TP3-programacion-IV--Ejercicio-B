import express from "express";
//import 'dotenv/config'; // carga las variables del .env
import { conectarDB } from './db.js';

conectarDB();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(" Hola mundo, el servidor esta funcionando y DB conectada!");
});

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});