import express from "express"
import { isAuthenticated } from "../middleware/auth.middleware"
import { EscalaController } from "../controllers/escala.controller"

const router = express.Router()
const escalaController = new EscalaController()

// Rotas para escalas (acessíveis por todos os usuários autenticados)
router.get("/", isAuthenticated, escalaController.getEscalas)
router.get("/:id", isAuthenticated, escalaController.getEscalaById)

export default router
