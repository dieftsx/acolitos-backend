import type { Request, Response } from "express"
import { User } from "../models/user.model"
import { Escala } from "../models/escala.model"

export class AcolitoController {
  // Obter perfil do acólito
  public getPerfil = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id

      const user = await User.findById(userId).select("-googleId")

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        })
      }

      return res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter perfil",
        error: (error as Error).message,
      })
    }
  }

  // Atualizar perfil do acólito
  public updatePerfil = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id
      const { nome, telefone, dataNascimento, tipo } = req.body

      // Campos que o acólito pode atualizar
      const updateData: any = {}
      if (nome) updateData.nome = nome
      if (telefone) updateData.telefone = telefone
      if (dataNascimento) updateData.dataNascimento = new Date(dataNascimento)
      if (tipo) updateData.tipo = tipo

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-googleId")

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Perfil atualizado com sucesso",
        data: user,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar perfil",
        error: (error as Error).message,
      })
    }
  }

  // Obter escalas do acólito
  public getEscalas = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id

      // Filtros opcionais
      const { status } = req.query

      const query: any = {
        "acolitos.acolito": userId,
      }

      if (status) {
        query["acolitos.status"] = status
      }

      const escalas = await Escala.find(query)
        .sort({ data: 1, hora: 1 })
        .populate("acolitos.acolito", "nome email foto")

      return res.status(200).json({
        success: true,
        count: escalas.length,
        data: escalas,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter escalas",
        error: (error as Error).message,
      })
    }
  }

  // Obter escala específica por ID
  public getEscalaById = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id
      const escalaId = req.params.id

      const escala = await Escala.findOne({
        _id: escalaId,
        "acolitos.acolito": userId,
      }).populate("acolitos.acolito", "nome email foto tipo")

      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada ou você não está incluído nela",
        })
      }

      return res.status(200).json({
        success: true,
        data: escala,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter escala",
        error: (error as Error).message,
      })
    }
  }

  // Responder a uma escala (confirmar, recusar)
  public responderEscala = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id
      const escalaId = req.params.id
      const { status, observacao } = req.body

      if (!status || !["confirmado", "recusado"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use "confirmado" ou "recusado"',
        })
      }

      const escala = await Escala.findOneAndUpdate(
        {
          _id: escalaId,
          "acolitos.acolito": userId,
        },
        {
          $set: {
            "acolitos.$.status": status,
            "acolitos.$.observacao": observacao || "",
          },
        },
        { new: true, runValidators: true },
      ).populate("acolitos.acolito", "nome email foto")

      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada ou você não está incluído nela",
        })
      }

      return res.status(200).json({
        success: true,
        message: `Resposta registrada com sucesso: ${status}`,
        data: escala,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao responder escala",
        error: (error as Error).message,
      })
    }
  }
}
