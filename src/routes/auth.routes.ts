import express from "express"
import { verifyFirebaseToken } from "../middleware/auth.middleware"
import { AuthController } from "../controllers/auth.controller"

const router = express.Router()
const authController = new AuthController()

// Verificar/criar usuário após autenticação Firebase
router.post("/verify", authController.verifyUser)

// Obter usuário atual
router.get("/me", verifyFirebaseToken, authController.getCurrentUser)

// Criar token customizado (para casos especiais)
router.post("/custom-token", authController.createCustomToken)

export default router
