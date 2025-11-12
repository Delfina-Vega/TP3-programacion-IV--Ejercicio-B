import express from "express";
import { db } from "../db.js";
import { validarId, verificarValidaciones } from "../validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// Get para listar medicos con filtro
router.get("/", verificarAutenticacion, async (req, res) => {
    try {
        const { nombre, apellido, especialidad } = req.query;

        let sql = "SELECT * FROM medicos WHERE 1=1";
        const params = [];

        if (nombre) {
            sql += " AND nombre LIKE ?";
            params.push(`%${nombre}%`);
        }

        if (apellido) {
            sql += " AND apellido LIKE ?";
            params.push(`%${apellido}%`);
        }

        if (especialidad) {
            sql += " AND especialidad LIKE ?";
            params.push(`%${especialidad}%`);
        }

        sql += " ORDER BY apellido, nombre";

        const [medicos] = await db.execute(sql, params);

        if (medicos.length === 0) {
            return res.json({
                success: true,
                message: "No se encontraron medicos con esos datos",
                medicos: [],
            });
        }

        res.json({
            success: true,
            medicos,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener medicos",
        });
    }
});

// Get para obtener un medico en especifico

router.get(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [medicos] = await db.execute(
                "SELECT * FROM medicos WHERE id=?",
                [id]
            );
            if (medicos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Medico no encontrado",

                });
            }
        res.json({
            success: true,
            medico: medicos[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener medico",
        });
    }
}
);

//Post para crear un nuevo medico
 router.post(
    "/",
    verificarAutenticacion,
    body("nombre").notEmpty().isLength({ max: 45 }).trim(),
    body("apellido").notEmpty().isLength({ max: 45 }).trim(),
    body("especialidad").notEmpty().isLength({ max: 45 }).trim(),
    body("matricula").notEmpty().isLength({ max: 50 }).trim(),
    verificarValidaciones,
    async (req, res) => {
        try {
            const { nombre, apellido, especialidad, matricula } = req.body;

            // Verifiacion para saber si la matricula existe
            const [medicosExistentes] = await db.execute(
                "SELECT id FROM medicos WHERE matricula=?",
                [matricula]
            );

            if (medicosExistentes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Ya existe un medico con esa matricula",
                });
            }

            //insertar medico
            const [result] = await db.execute(
                "INSERT INTO medicos (nombre, apellido, especialidad, matricula) VALUES (?,?,?,?)",
                [nombre, apellido, especialidad, matricula]
            );

            res.status(201).json({
                success: true,
                message: "Medico creado exitosamente",
                data: {
                    id: result.insertId,
                    nombre,
                    apellido,
                    especialidad,
                    matricula,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al crear medico",
            });
        }
    }
    
 );

 //Put para modificar medico
 router.put(
    "/:id",
    verificarAutenticacion,
    validarId,
    body("nombre").notEmpty().isLength({ max: 45 }).trim(),
    body("apellido").notEmpty().isLength({ max: 45 }).trim(),
    body("especialidad").notEmpty().isLength({ max: 45 }).trim(),
    body("matricula").notEmpty().isLength({ max: 50 }).trim(),
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { nombre, apellido, especialidad, matricula } = req.body;

            //verificar si el medico existe
            const [medicoExistente] = await db.execute(
                "SELECT id FROM medicos WHERE id=?",
                [id]
            );

            if (medicoExistente.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Medico no encontrado",
                });
            }

        // verificacion de matricula en uso por otro medico
        const [matriculaDuplicada] = await db.execute(
            "SELECT id FROM medicos WHERE matricula=? AND id!=?",
            [matricula, id]
        );
      
        if (matriculaDuplicada.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Ya existe otro medico con esa matricula",
            });
        }

        //Actualizamos medico
        await db.execute(
            "UPDATE medicos SET nombre=?, apellido=?, especialidad=?, matricula=? WHERE id=?",
            [nombre, apellido, especialidad, matricula, id]

        );

        res.json({
            success: true, 
            message: "Medico modificado exitosamente",
            data: {
                id,
                nombre,
                apellido,
                matricula,
            },
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al modificar medico",
            });
        }
    }
    

 );

 //Delete eliminar medico

 router.delete(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            //verificar si el medico existe
            const [medico] = await db.execute(
                "SELECT id FROM medicos WHERE id=?",
                [id]
            );

        if (medico.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Medico no encontrado",

            });
        }

        //Eliminar medico
        await db.execute("DElETE FROM medicos WHERE id=?", [id]);

        res.json({
            success: true,
            message: "Medico eliminado exitosamente",
            data: { id },

        });
        } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar medico",
      });
    }
  }
 );

 export default router;