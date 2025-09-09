import type { Request, Response, NextFunction } from "express"
import { auth } from "../config/firebase"
import { UserService } from "../services/user.service"

interface AuthenticatedRequest extends Request {
  user?: any
}

const userService = new UserService()

// Middleware para verificar token Firebase
export const verifyFirebaseToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token de autorização não fornecido",
      })
    }

    const token = authHeader.split("Bearer ")[1]
    const decodedToken = await auth.verifyIdToken(token)

    // Buscar dados completos do usuário no Firestore
    const user = await userService.getUserByUid(decodedToken.uid)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Erro na verificação do token:", error)
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    })
  }
}

// Middleware para verificar se o usuário é um administrador
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado. Você não tem permissão para acessar este recurso.",
  })
}

// Middleware para verificar se o usuário é um acólito
export const isAcolito = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === "acolito" || req.user.role === "admin")) {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: "Acesso negado. Você não tem permissão para acessar este recurso.",
  })
}

// Middleware para verificar se o usuário está ativo
export const isActive = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.status === "ativo") {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: "Sua conta está inativa ou pendente de aprovação.",
  })
}

