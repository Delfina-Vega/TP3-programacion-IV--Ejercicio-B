import express from "express";
import { db } from "../db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";

const router = express.Router();

export function authConfig() {
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(
        new Strategy(jwtOptions, async (payload, next) => {
            //Token valido, pasa al siguiente middleware
            next(null, payload);
        }) 
    );
}

// Midleware para verificar autenticacion
export const verificarAutenticacion = passport.authenticate("jwt", {
    session: false,
});

// POST para Registrar nuevo usuario

router.post(
    "/register",
    body("nombre").notEmpty().isLength({ max: 100 }),
    body("email").isEmail().isLength({ max: 100 }),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 0,
        minNumbers: 1,
        minSymbols: 0,
    }),
    verificarValidaciones,
    async (req, res) => {
        try {
            const { nombre, email, password } = req.body;

            //Verifica si el email ya existe
            const [usuarios] = await db.execute(
                "SELECT id FROM usuarios WHERE email=?",
                [email]
            );

            if (usuarios.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "El email ya esta registrado",
                });
            }

            // Hash de la contrasela
            const hashedPassword = await bcrypt.hash(password, 12
            );

            const [result] = await db.execute(
                "INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)",
                [nombre, email, hashedPassword]
            );

            res.status(201).json({
                success: true,
                message: "Usuario registrado exitosamente",
                data: { id: result.insertId, nombre, email },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al registrar usuario",
            });
        }
    }
);

// POST para iniciar sesion

router.post(
    "/login",
    body("email").isEmail(),
    body("password").notEmpty(),
    verificarValidaciones,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Busca usuario
            const [usuarios] = await db.execute(
                "SELECT * FROM usuarios WHERE email=?",
                [email]
            );

            if (usuarios.length === 0 ) {
                return res.status(401).json({
                    success:false,
                    message: "Credenciales invalidas",

                });
            }
            const usuario = usuarios[0];

            // Vetificacion de contraseña
            const passwordValida = await bcrypt.compare(password, usuario.password);

            if (!passwordValida) {
                return res.status(401).json({
                    success: false,
                    message: "Credenciales invalidas",
                });
            }

            //Genera jwb que expira en 4 horas
            const payload = {
                userId: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
            };

            const token = jwt.sign(payload,process.env.JWT_SECRET, {
                expiresIn: "4h",
            });

            res.json({
                success: true,
                token,
                usuario: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al iniciar sesion",
            });
        }
    }
);

export default router;