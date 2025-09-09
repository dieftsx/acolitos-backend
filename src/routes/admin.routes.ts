import express from "express"
import { verifyFirebaseToken, isAdmin } from "../middleware/auth.middleware"
import { AdminController } from "../controllers/admin.controller"

const router = express.Router()
const adminController = new AdminController()

// Rotas protegidas para administradores
router.get("/dashboard", verifyFirebaseToken, isAdmin, adminController.getDashboard)

// Gerenciamento de acólitos
router.get("/acolitos", verifyFirebaseToken, isAdmin, adminController.getAllAcolitos)
router.get("/acolitos/:id", verifyFirebaseToken, isAdmin, adminController.getAcolitoById)
router.put("/acolitos/:id", verifyFirebaseToken, isAdmin, adminController.updateAcolito)
router.put("/acolitos/:id/status", verifyFirebaseToken, isAdmin, adminController.updateAcolitoStatus)

// Gerenciamento de escalas
router.post("/escalas", verifyFirebaseToken, isAdmin, adminController.createEscala)
router.get("/escalas", verifyFirebaseToken, isAdmin, adminController.getAllEscalas)
router.get("/escalas/:id", verifyFirebaseToken, isAdmin, adminController.getEscalaById)
router.put("/escalas/:id", verifyFirebaseToken, isAdmin, adminController.updateEscala)
router.delete("/escalas/:id", verifyFirebaseToken, isAdmin, adminController.deleteEscala)

export default router
