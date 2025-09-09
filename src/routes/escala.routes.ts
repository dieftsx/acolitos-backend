import express from "express"
import { isAuthenticated } from "../middleware/auth.middleware"
import { EscalaController } from "../controllers/escala.controller"
import { Request, Response, NextFunction } from 'express';

const router = express.Router()
const escalaController = new EscalaController()

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) { 
        return next();
    }
    res.status(401).json({ success: false, message: "Unauthorized" });
    return
    next();
};

// Rotas para escalas (acessíveis por todos os usuários autenticados)
router.get("/", isAuthenticated, escalaController.getEscalas)
router.get("/:id", isAuthenticated, escalaController.getEscalaById)

export default router
