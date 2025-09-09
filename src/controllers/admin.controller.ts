import type { Request, Response } from "express"
import { UserService } from "../services/user.service"
import { EscalaService } from "../services/escala.service"

export class AdminController {
  private userService = new UserService()
  private escalaService = new EscalaService()

  // Obter dados para o dashboard
  public getDashboard = async (req: Request, res: Response) => {
    try {
      const [userStats, escalaStats, proximasMissas] = await Promise.all([
        this.userService.getUserStats(),
        this.escalaService.getEscalaStats(),
        this.escalaService.getProximasEscalas(5),
      ])

      return res.status(200).json({
        success: true,
        data: {
          ...userStats,
          ...escalaStats,
          proximasMissas,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter dados do dashboard",
        error: (error as Error).message,
      })
    }
  }

  // Obter todos os acólitos
  public getAllAcolitos = async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query

      const acolitos = await this.userService.getAllUsers({
        role: "acolito",
        status: status as string,
        search: search as string,
      })

      return res.status(200).json({
        success: true,
        count: acolitos.length,
        data: acolitos,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter acólitos",
        error: (error as Error).message,
      })
    }
  }

  // Obter acólito por ID
  public getAcolitoById = async (req: Request, res: Response) => {
    try {
      const acolitoId = req.params.id

      const acolito = await this.userService.getUserById(acolitoId)
      if (!acolito || acolito.role !== "acolito") {
        return res.status(404).json({
          success: false,
          message: "Acólito não encontrado",
        })
      }

      // Obter escalas do acólito
      const escalas = await this.escalaService.getEscalasByAcolito(acolitoId)

      return res.status(200).json({
        success: true,
        data: {
          acolito,
          escalas: escalas.slice(0, 10), // Últimas 10 escalas
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter acólito",
        error: (error as Error).message,
      })
    }
  }

  // Atualizar acólito
  public updateAcolito = async (req: Request, res: Response) => {
    try {
      const acolitoId = req.params.id
      const { nome, telefone, dataNascimento, tipo, status } = req.body

      const updateData: any = {}
      if (nome) updateData.nome = nome
      if (telefone) updateData.telefone = telefone
      if (dataNascimento) updateData.dataNascimento = dataNascimento
      if (tipo) updateData.tipo = tipo
      if (status) updateData.status = status

      const acolito = await this.userService.updateUser(acolitoId, updateData)

      if (!acolito) {
        return res.status(404).json({
          success: false,
          message: "Acólito não encontrado",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Acólito atualizado com sucesso",
        data: acolito,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar acólito",
        error: (error as Error).message,
      })
    }
  }

  // Atualizar status do acólito
  public updateAcolitoStatus = async (req: Request, res: Response) => {
    try {
      const acolitoId = req.params.id
      const { status } = req.body

      if (!status || !["ativo", "inativo", "pendente"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido. Use "ativo", "inativo" ou "pendente"',
        })
      }

      const acolito = await this.userService.updateUser(acolitoId, { status })

      if (!acolito) {
        return res.status(404).json({
          success: false,
          message: "Acólito não encontrado",
        })
      }

      return res.status(200).json({
        success: true,
        message: `Status do acólito atualizado para ${status}`,
        data: acolito,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar status do acólito",
        error: (error as Error).message,
      })
    }
  }

  // Criar nova escala
  public createEscala = async (req: Request, res: Response) => {
    try {
      const { data, hora, tipo, local, descricao, acolitos } = req.body

      if (!data || !hora || !local || !acolitos || !Array.isArray(acolitos)) {
        return res.status(400).json({
          success: false,
          message: "Dados incompletos. Forneça data, hora, local e lista de acólitos",
        })
      }

      // Verificar se todos os acólitos existem
      const acolitosIds = acolitos.map((a: any) => a.acolitoId)
      const acolitosExistentes = await Promise.all(acolitosIds.map((id: string) => this.userService.getUserById(id)))

      const acolitosValidos = acolitosExistentes.filter(
        (acolito) => acolito && acolito.role === "acolito" && acolito.status === "ativo",
      )

      if (acolitosValidos.length !== acolitosIds.length) {
        return res.status(400).json({
          success: false,
          message: "Um ou mais acólitos não existem ou não estão ativos",
        })
      }

      // Criar a escala
      const novaEscala = await this.escalaService.createEscala({
        data,
        hora,
        tipo: tipo || "Missa",
        local,
        descricao,
        acolitos: acolitos.map((a: any) => ({
          acolitoId: a.acolitoId,
          status: "pendente",
        })),
      })

      return res.status(201).json({
        success: true,
        message: "Escala criada com sucesso",
        data: novaEscala,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao criar escala",
        error: (error as Error).message,
      })
    }
  }

  // Obter todas as escalas
  public getAllEscalas = async (req: Request, res: Response) => {
    try {
      const { status, data, tipo } = req.query

      const escalas = await this.escalaService.getAllEscalas({
        status: status as string,
        data: data as string,
        tipo: tipo as string,
      })

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

  // Obter escala por ID
  public getEscalaById = async (req: Request, res: Response) => {
    try {
      const escalaId = req.params.id

      const escala = await this.escalaService.getEscalaById(escalaId)

      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada",
        })
      }

      // Buscar dados dos acólitos
      const acolitosData = await Promise.all(
        escala.acolitos.map(async (a) => {
          const acolito = await this.userService.getUserById(a.acolitoId)
          return {
            ...a,
            acolito: acolito
              ? {
                  id: acolito.id,
                  nome: acolito.nome,
                  email: acolito.email,
                  foto: acolito.foto,
                  telefone: acolito.telefone,
                  tipo: acolito.tipo,
                }
              : null,
          }
        }),
      )

      return res.status(200).json({
        success: true,
        data: {
          ...escala,
          acolitos: acolitosData,
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao obter escala",
        error: (error as Error).message,
      })
    }
  }

  // Atualizar escala
  public updateEscala = async (req: Request, res: Response) => {
    try {
      const escalaId = req.params.id
      const { data, hora, tipo, local, descricao, status, acolitos } = req.body

      const updateData: any = {}
      if (data) updateData.data = data
      if (hora) updateData.hora = hora
      if (tipo) updateData.tipo = tipo
      if (local) updateData.local = local
      if (descricao !== undefined) updateData.descricao = descricao
      if (status) updateData.status = status

      // Se houver atualização de acólitos, verificar se todos existem
      if (acolitos && Array.isArray(acolitos)) {
        const acolitosIds = acolitos.map((a: any) => a.acolitoId)
        const acolitosExistentes = await Promise.all(acolitosIds.map((id: string) => this.userService.getUserById(id)))

        const acolitosValidos = acolitosExistentes.filter((acolito) => acolito)

        if (acolitosValidos.length !== acolitosIds.length) {
          return res.status(400).json({
            success: false,
            message: "Um ou mais acólitos não existem",
          })
        }

        updateData.acolitos = acolitos
      }

      const escala = await this.escalaService.updateEscala(escalaId, updateData)

      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada",
        })
      }

      return res.status(200).json({
        success: true,
        message: "Escala atualizada com sucesso",
        data: escala,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar escala",
        error: (error as Error).message,
      })
    }
  }

  // Excluir escala
  public deleteEscala = async (req: Request, res: Response) => {
    try {
      const escalaId = req.params.id

      const escala = await this.escalaService.getEscalaById(escalaId)
      if (!escala) {
        return res.status(404).json({
          success: false,
          message: "Escala não encontrada",
        })
      }

      await this.escalaService.deleteEscala(escalaId)

      return res.status(200).json({
        success: true,
        message: "Escala excluída com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao excluir escala",
        error: (error as Error).message,
      })
    }
  }
}
