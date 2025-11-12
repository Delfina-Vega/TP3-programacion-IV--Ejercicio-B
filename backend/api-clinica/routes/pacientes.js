import express from "express";
import { db } from "../db.js";
import { validarId, verificarValidaciones } from "../validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

//Get para listar todos los pacientes con filtro

router.get("/", verificarAutenticacion, async (req, res) => {
    try {
        const { nombre, apellido, dni } = req.query;
        
        let sql = "SELECT * FROM pacientes WHERE 1=1";
        const params = [];

        if (nombre) {
            sql += " AND nombre LIKE ?";
            params.push(`%${nombre}%`);
        }

        if (apellido) {
            sql += " AND apellido LIKE ?";
            params.push(`%${apellido}%`);
        }

        if (dni) {
            sql += " AND dni LIKE ?";
            params.push(`%${dni}%`);
        }

        sql += " ORDER BY apellido, nombre";

        const [pacientes] = await db.execute(sql, params);

        if (pacientes.length === 0) {
            return res.json({
                success: true,
                message: "No se encontraron pacientes con esos datos",
                pacientes: [],
            });
        } 

    res.json({
        success: true,
        pacientes,
    });

    }catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener pacientes",
        });
    }
});

// Get para obtener a un paciente en especifico

router.get(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const [pacientes] = await db.execute (
            "SELECT * FROM pacientes WHERE id=?",
            [id]   
         );

         if (pacientes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Paciente no encontrado",
           });
         }
        res.json({
            success: true,
            paciente: pacientes[0],
        });

     } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener paciente",
        });
     }
  }
);

// Post para crear un nuevo paciente 
router.post(
    "/",
    verificarAutenticacion,
    body("nombre").notEmpty().isLength({ max: 45 }).trim(),
    body("apellido").notEmpty().isLength({ max: 45 }).trim(),
    body("dni").notEmpty().isLength({ min: 7, max: 20, }).trim()
    .withMessage("El DNI debe contener solo numeros"),
    body("fecha_nacimiento").notEmpty().isDate(),
    body("obra_social").optional().isLength({ max: 100 }).trim(),
    verificarValidaciones,
    async (req, res) => {
        try {
          const { nombre, apellido, dni, fecha_nacimiento, obra_social } = req.body;
     //Verifica si el DNI ya existe 

          const [pacientesExistentes] = await db.execute(
           "SELECT id FROM pacientes WHERE dni=?",
            [dni]
           );

        if (pacientesExistentes.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Ya existe un paciente con ese DNI",

              });
           }

    //Insertar paciente
        const [result] = await db.execute(
        "INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, obra_social) VALUES (?,?,?,?,?)",
        [nombre, apellido, dni, fecha_nacimiento, obra_social]

       );
       res.status(201).json({
       success: true,
       message: "Paciente creado exitosamente",
       data: {
        id: result.insertId,
        nombre,
        apellido,
        dni,
        fecha_nacimiento,
        obra_social,
        },
        
    });

        }catch (error) {
            console.error(error);
            res.status(500).json({
            success: false,
            message: "Error al crear paciente",
    
        });
        }
    }
);

//Modificar paciente
router.put(
    "/:id",
    verificarAutenticacion,
    validarId,
    body("nombre").notEmpty().isLength({ max: 45 }).trim(),
    body("apellido").notEmpty().isLength({ max: 45 }).trim(),
    body("dni").notEmpty().isLength({ min: 7, max: 20 }).isNumeric()
    .withMessage("El DNI debe contener solo números").trim(),
    body("fecha_nacimiento").notEmpty().isDate(),
    body("obra_social").optional().isLength({ max: 100 }).trim(),
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { nombre, apellido, dni, fecha_nacimiento, obra_social } = req.body;

            //Verifica si el paciente existe
            const [pacienteExistente] = await db.execute(
                "SELECT id FROM pacientes WHERE id=?",
                [id]
            );

        if (pacienteExistente.length === 0) {
         return res.status(404).json({
                success: false,
                message: "Paciente no encontrado",
             });
          }

    //Verifica si el dni ya esta en uso por otro paciente
        const [dniDuplicado] = await db.execute(
          "SELECT id FROM pacientes WHERE dni=? AND id!=?",
           [dni, id]
        );

        if( dniDuplicado.length > 0) {
          return res.status(400).json({
                 success: false,
                 message: "Ya existe otro paciente con ese DNI",

                });
            }

    //Actualizar paciente
         await db.execute(
          "UPDATE pacientes SET nombre=?, apellido=?, dni=?, fecha_nacimiento=?, obra_social=? WHERE id=?",
           [nombre, apellido, dni, fecha_nacimiento, obra_social, id]
         );
            
        res.json({
                 success: true,
                 message: "Paciente modificado exitosamente",
                data: {
                    id,
                    nombre,
                    apellido,
                    dni,
                    fecha_nacimiento,
                    obra_social,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al modificar paciente",
            });
        }
    }
);

//Eliminar paciente

router.delete(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

    //Verificar si el paciente existe
            const [paciente] = await db.execute(
                "SELECT id FROM pacientes WHERE id=?",
                [id]
            );

       if (paciente.length === 0) {
        return res.status(404).json({
               success: false,
               message: "Paciente no encontrado",
              });
           }

       //Eliminar paciente 
             await db.execute("DELETE FROM pacientes WHERE id=?", [id]);
               res.json({
               success: true,
               message: "Paciente eliminado exitosamente",
               data: { id },
               });
                } catch (error) {
                  console.error(error);
                  res.status(500).json({
                   success: false,
                   message: "Error al eliminar paciente",

                        });
                     }
                }
            );

     export default router;