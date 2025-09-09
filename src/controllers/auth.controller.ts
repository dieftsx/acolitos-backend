import type { Request, Response } from "express"
import { auth } from "../config/firebase"
import { UserService } from "../services/user.service"

export class AuthController {
  private userService = new UserService()

  // Verificar/criar usuário após autenticação Firebase
  public verifyUser = async (req: Request, res: Response) => {
    try {
      const { uid, email, name, picture } = req.body

      if (!uid || !email) {
        return res.status(400).json({
          success: false,
          message: "UID e email são obrigatórios",
        })
      }

      // Verificar se o usuário já existe
      let user = await this.userService.getUserByUid(uid)

      if (!user) {
        // Criar novo usuário
        user = await this.userService.createUser({
          uid,
          email,
          nome: name || email.split("@")[0],
          foto: picture,
          role: "acolito",
          status: "pendente",
        })
      }

      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      })
    }
  }

  // Obter usuário atual
  public getCurrentUser = async (req: Request, res: Response) => {
    try {
      const user = req.user

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        })
      }

      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter usuário atual",
        error: (error as Error).message,
      })
    }
  }

  // Criar token customizado (para casos especiais)
  public createCustomToken = async (req: Request, res: Response) => {
    try {
      const { uid } = req.body

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: "UID é obrigatório",
        })
      }

      const customToken = await auth.createCustomToken(uid)

      return res.status(200).json({
        success: true,
        data: { customToken },
      })
    } catch (error) {
      console.error("Erro ao criar token customizado:", error)
      return res.status(500).json({
        success: false,
        message: "Erro ao criar token customizado",
      })
    }
  }
}
