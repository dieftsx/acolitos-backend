import { db, COLLECTIONS } from "../config/firebase"
import type { IEscala, CreateEscalaData, UpdateEscalaData } from "../models/escala.model"

export class EscalaService {
  private collection = db.collection(COLLECTIONS.ESCALAS)

  async createEscala(escalaData: CreateEscalaData): Promise<IEscala> {
    const now = new Date().toISOString()
    const newEscala: Omit<IEscala, "id"> = {
      ...escalaData,
      status: "agendada",
      acolitos: escalaData.acolitos.map((a) => ({
        ...a,
        status: a.status || "pendente",
      })),
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await this.collection.add(newEscala)
    return { ...newEscala, id: docRef.id }
  }

  async getEscalaById(id: string): Promise<IEscala | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null

    return { id: doc.id, ...doc.data() } as IEscala
  }

  async updateEscala(id: string, updateData: UpdateEscalaData): Promise<IEscala | null> {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await this.collection.doc(id).update(updatePayload)
    return this.getEscalaById(id)
  }

  async deleteEscala(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }

  async getAllEscalas(filters?: {
    status?: string
    data?: string
    tipo?: string
  }): Promise<IEscala[]> {
    let query = this.collection.orderBy("data").orderBy("hora")

    if (filters?.status) {
      query = query.where("status", "==", filters.status) as any
    }

    if (filters?.tipo) {
      query = query.where("tipo", "==", filters.tipo) as any
    }

    const snapshot = await query.get()
    let escalas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IEscala)

    // Filtro por data específica
    if (filters?.data) {
      const targetDate = new Date(filters.data).toISOString().split("T")[0]
      escalas = escalas.filter((escala) => escala.data.split("T")[0] === targetDate)
    }

    return escalas
  }

  async getEscalasByAcolito(
    acolitoId: string,
    filters?: {
      status?: string
    },
  ): Promise<IEscala[]> {
    const snapshot = await this.collection
      .where("acolitos", "array-contains-any", [{ acolitoId }])
      .orderBy("data")
      .orderBy("hora")
      .get()

    let escalas = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as IEscala)
      .filter((escala) => escala.acolitos.some((a) => a.acolitoId === acolitoId))

    if (filters?.status) {
      escalas = escalas.filter((escala) =>
        escala.acolitos.some((a) => a.acolitoId === acolitoId && a.status === filters.status),
      )
    }

    return escalas
  }

  async updateAcolitoResponse(
    escalaId: string,
    acolitoId: string,
    status: "confirmado" | "recusado",
    observacao?: string,
  ): Promise<IEscala | null> {
    const escala = await this.getEscalaById(escalaId)
    if (!escala) return null

    const updatedAcolitos = escala.acolitos.map((a) =>
      a.acolitoId === acolitoId ? { ...a, status, observacao: observacao || "" } : a,
    )

    return this.updateEscala(escalaId, { acolitos: updatedAcolitos })
  }

  async getProximasEscalas(limit = 5): Promise<IEscala[]> {
    const hoje = new Date()
    const proximaSemana = new Date()
    proximaSemana.setDate(hoje.getDate() + 7)

    const snapshot = await this.collection
      .where("data", ">=", hoje.toISOString())
      .where("data", "<=", proximaSemana.toISOString())
      .orderBy("data")
      .orderBy("hora")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IEscala)
  }

  async getEscalaStats(): Promise<{
    totalEscalas: number
    escalasPendentes: number
    escalasAgendadas: number
  }> {
    const [totalSnapshot, pendentesSnapshot, agendadasSnapshot] = await Promise.all([
      this.collection.get(),
      this.collection.where("status", "==", "pendente").get(),
      this.collection.where("status", "==", "agendada").get(),
    ])

    return {
      totalEscalas: totalSnapshot.size,
      escalasPendentes: pendentesSnapshot.size,
      escalasAgendadas: agendadasSnapshot.size,
    }
  }
}
