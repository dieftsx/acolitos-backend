import express from "express";
import { isAcolito, verifyFirebaseToken } from "../middleware/auth.middleware";
import { AcolitoController } from "../controllers/acolito.controller";

const router = express.Router()
const acolitoController = new AcolitoController()

router.get("/perfil", verifyFirebaseToken, isAcolito, acolitoController.getPerfil)
router.put("/perfil", verifyFirebaseToken, isAcolito, acolitoController.updatePerfil)
router.get("/escalas", verifyFirebaseToken, isAcolito, acolitoController.getEscalas)
router.get("/escalas/:id", verifyFirebaseToken, isAcolito, acolitoController.getEscalaById)
router.put("/escalas/:id/responder", verifyFirebaseToken, isAcolito, acolitoController.responderEscala)

export default router
