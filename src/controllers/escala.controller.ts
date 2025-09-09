import type { Request, Response } from "express"
import { Escala } from "../models/escala.model"

export class EscalaController {
  // Obter escalas (para todos os usuários autenticados)
  public getEscalas = async (req: Request, res: Response) => {
    try {
      const { status, data, tipo } = req.query

      const query: any = {}

      if (status) {
        query.status = status
      }

      if (data) {
        // Filtrar por data específica
        const dataFiltro = new Date(data as string)
        const dataInicio = new Date(dataFiltro)
        dataInicio.setHours(0, 0, 0, 0)

        const dataFim = new Date(dataFiltro)
        dataFim.setHours(23, 59, 59, 999)

        query.data = { $gte: dataInicio, $lte: dataFim }
      }

      if (tipo) {
        query.tipo = tipo
      }

      // Limitar informações para usuários não-admin
      const escalas = await Escala.find(query)
        .sort({ data: 1, hora: 1 })
        .select("data hora tipo local status")
        .limit(20)

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

  // Obter escala por ID (para todos os usuários autenticados)
  public getEscalaById = async (req: Request, res: Response) => {
    try {
      const escalaId = req.params.id

      const escala = await Escala.findById(escalaId).select("data hora tipo local status descricao")

      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada",
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
}
