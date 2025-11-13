import express from "express";
import { db } from "../db.js";
import { validarId, verificarValidaciones } from "../validaciones.js";
import { body } from "express-validator";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

// Get para listar todos los turnos 
router.get("/", verificarAutenticacion, async (req, res) => {
  try {
    const { paciente_id, medico_id, fecha, estado } = req.query;

    let sql = `
      SELECT 
        t.id,
        t.paciente_id,
        t.medico_id,
        t.fecha,
        t.hora,
        t.estado,
        t.observaciones,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
        m.nombre AS medico_nombre,
        m.apellido AS medico_apellido,
        m.especialidad AS medico_especialidad
      FROM turnos t
      JOIN pacientes p ON t.paciente_id = p.id
      JOIN medicos m ON t.medico_id = m.id
      WHERE 1=1
    `;
    const params = [];

    //Se agrega filtros
    if (paciente_id) {
      sql += " AND t.paciente_id = ?";
      params.push(Number(paciente_id));
    }

    if (medico_id) {
      sql += " AND t.medico_id = ?";
      params.push(Number(medico_id));
    }

    if (fecha) {
      sql += " AND t.fecha = ?";
      params.push(fecha);
    }

    if (estado) {
      sql += " AND t.estado = ?";
      params.push(estado);
    }

    sql += " ORDER BY t.fecha DESC, t.hora DESC";

    const [turnos] = await db.execute(sql, params);

    if (turnos.length === 0) {
      return res.json({
        success: true,
        message: "No se encontraron turnos con esos datos",
        turnos: [],
      });
    }

    res.json({
      success: true,
      turnos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos",
    });
  }
});

//Get para obtener un turno en especifico
router.get(
    "/:id",
    verificarAutenticacion,
    validarId,
    verificarValidaciones,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

        const sql = `
        SELECT 
          t.id,
          t.paciente_id,
          t.medico_id,
          t.fecha,
          t.hora,
          t.estado,
          t.observaciones,
          p.nombre AS paciente_nombre,
          p.apellido AS paciente_apellido,
          p.dni AS paciente_dni,
          m.nombre AS medico_nombre,
          m.apellido AS medico_apellido,
          m.especialidad AS medico_especialidad,
          m.matricula AS medico_matricula
        FROM turnos t
        JOIN pacientes p ON t.paciente_id = p.id
        JOIN medicos m ON t.medico_id = m.id
        WHERE t.id = ?
      `;

         const [turnos] = await db.execute(sql, [id]);

         if (turnos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Turno no encontrado",

            });
         }
         res.json({
            success: true,
            turno: turnos[0],
         });
      } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener turno",
        });
      }
    }
);

//Post crear nuevo turno
router.post(
    "/",
    verificarAutenticacion,
    body("paciente_id").isInt({ min: 1 }),
    body("medico_id").isInt({ min: 1 }),
    body("fecha").isDate(),
    body("hora").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("observaciones").optional().isLength({ max: 500 }).trim(),
    verificarValidaciones,
    async(req, res) => {
        try {
            const { paciente_id, medico_id, fecha, hora, observaciones } = req.body;

            //verifico que el paciente exista
            const [paciente] = await db.execute(
                "SELECT id FROM pacientes WHERE id=?",
                [paciente_id]
            );

            if (paciente.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "El paciente no existe",
                });
            }

        // vrifico que el medico exista 
        const [medico] = await db.execute(
        "SELECT id FROM medicos WHERE id=?",
        [medico_id]
      );

      if (medico.length === 0) {
        return res.status(404).json({
          success: false,
          message: "El médico no existe",
        });
      }

      //Verifico que no haya otro turno en la misma fecha y hora con el mismo medico
      const [turnoExistente] = await db.execute(
        "SELECT id FROM turnos WHERE medico_id=? AND fecha=? AND hora=?",
        [medico_id, fecha, hora]
      );

        if (turnoExistente.length > 0 ) {
            return res.status(400).json({
                success: false,
                message: "Ya existe un turno para ese medico en esa fecha y hora",
            });
        }

        //Insertar turno  (estado por defecto Pendiente)
        const [result] = await db.execute(
            "INSERT INTO turnos (paciente_id, medico_id, fecha, hora, observaciones) VALUES (?,?,?,?,?)",
            [paciente_id, medico_id, fecha, hora, observaciones || null]
        );

        res.status(201).json({
        success: true,
        message: "Turno creado exitosamente",
        data: {
        id: result.insertId,
        paciente_id,
        medico_id,
        fecha,
        hora,
        estado: "pendiente",
        observaciones,
        },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Error al crear turno",
    });
  }
}

);

//Put para modificar turno
router.put(
 "/:id",
  verificarAutenticacion,
  validarId,
  body("paciente_id").isInt({ min: 1 }),
  body("medico_id").isInt({ min: 1 }),
  body("fecha").isDate(),
  body("hora").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body("estado").isIn(["pendiente", "atendido", "cancelado"]),
  body("observaciones").optional().isLength({ max: 500 }).trim(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { paciente_id, medico_id, fecha, hora, estado, observaciones } = req.body;

    //Verifica que el turno existe
    const [turnoExistente] = await db.execute(
        "SELECT id FROM turnos WHERE id=?",
        [id]
    );

    if (turnoExistente.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Turno no encontrado",
        });
    }

    //verificar que el paciente exista 
    const [paciente] = await db.execute(
        "SELECT id FROM pacientes WHERE id=?",
        [paciente_id]
    );

    if (paciente.length === 0) {
        return res.status(404).json({
            success: false,
            message: "El paciente no existe",
        });
    }

    //verificar que el medico exista
    const [medico] = await db.execute(
        "SELECT id FROM medicos WHERE id=?",
        [medico_id]
    );

    if (medico.length === 0) {
        return res.status(404).json({
        success: false,
        message: "El medico no existe",

        });
    }

    //verificar conflicto de horario
    const [conflicto] = await db.execute(
        "SELECT id FROM turnos WHERE medico_id=? AND fecha=? AND hora=? AND id!=? ",
        [medico_id, fecha, hora, id]
    );

    if (conflicto.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Ya existe otro turno para ese medico en esa fecha y horario",
        });
    }

    //actualizar turno
    await db.execute(
        "UPDATE turnos SET paciente_id=?, medico_id=?, fecha=?, hora=?, estado=?, observaciones=? WHERE id=?",
        [paciente_id, medico_id, fecha, hora, estado, observaciones || null, id]
      );

      res.json({
        success: true,
        message: "Turno modificado exitosamente",
        data: {
          id,
          paciente_id,
          medico_id,
          fecha,
          hora,
          estado,
          observaciones,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error al modificar turno",
      });
    }
  }
);

// Se implemento " Patch " para cambiar solo el estado del turno

router.patch(
    "/:id/estado",
    verificarAutenticacion,
    validarId,
    body("estado").isIn(["pendiente", "atendido", "cancelado"]),
    verificarValidaciones,
    async (req, res) => {

        try {
          const id = Number(req.params.id);
          const { estado } = req.body;

       //verificar qu el turno existe
       const [turno] = await db.execute(
        "SELECT id FROM turnos WHERE id=?",
        [id]
      );

      if (turno.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Turno no encontrado",
        });
      }

      //actualizar solo el estado
      await db.execute(
        "UPDATE turnos SET estado=? WHERE id=?",
        [estado, id]
      );

      res.json({
        success: true,
        message: "Estado del turno actualizado exitosamente",
        data: { id, estado },
      });        

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar estado del turno",
        });
    }
  }
 );

     //Patch para agregar o modificar observaciones

     router.patch(
        "/:id/observaciones",
        verificarAutenticacion, 
        validarId,
        body("observaciones").notEmpty().isLength({ max: 500 }).trim(),
        verificarValidaciones,
        async (req, res) => {
            try {
              const id = Number(req.params.id);
              const { observaciones } = req.body;

         // Verificar que el turno exista
         const [turno] = await db.execute(
            "SELECT id FROM turnos WHERE id=?",
            [id]
         );

         if (turno.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Turno no encontrado",
            });
         }

         // actualizar observaciones
         await db.execute (
            "UPDATE turnos SET observaciones=? WHERE id=?",
            [observaciones, id]
         );

         res.json({
            success: true,
            message: "Observaciones actualizadas exitosamente",
            data: { id, observaciones },
         });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al actualizar observaciones",
            });
          }
        }
    );

    // Delete para Eliminar turno
    router.delete(
        "/:id",
        verificarAutenticacion,
        validarId,
        verificarValidaciones,
        async (req, res) => {
            try {
                const id = Number(req.params.id);

    // verificar que el turno existe
    const [turno] = await db.execute(
        "SELECT id FROM turnos WHERE id=?",
        [id]
    );

    if (turno.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Turno no encontrado",
        });
    }

    //Eliminar turno
    await db.execute("DELETE FROM turnos WHERE id=?", [id]);

    res.json({
        success: true,
        message: "Turno eliminado exitosamente",
        data: { id},
    });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar turno",
        });
      }
    }
);

export default router;
