import { db, COLLECTIONS } from "../config/firebase"
import type { IUser, CreateUserData, UpdateUserData } from "../models/user.model"

export class UserService {
  private collection = db.collection(COLLECTIONS.USERS)

  async createUser(userData: CreateUserData): Promise<IUser> {
    const now = new Date().toISOString()
    const newUser: Omit<IUser, "id"> = {
      ...userData,
      role: userData.role || "acolito",
      status: userData.status || "pendente",
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await this.collection.add(newUser)
    const user = { ...newUser, id: docRef.id }

    return user
  }

  async getUserById(id: string): Promise<IUser | null> {
    const doc = await this.collection.doc(id).get()
    if (!doc.exists) return null

    return { id: doc.id, ...doc.data() } as IUser
  }

  async getUserByUid(uid: string): Promise<IUser | null> {
    const snapshot = await this.collection.where("uid", "==", uid).limit(1).get()
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as IUser
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const snapshot = await this.collection.where("email", "==", email).limit(1).get()
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as IUser
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await this.collection.doc(id).update(updatePayload)
    return this.getUserById(id)
  }

  async getAllUsers(filters?: {
    role?: string
    status?: string
    search?: string
  }): Promise<IUser[]> {
    let query = this.collection.orderBy("nome")

    if (filters?.role) {
      query = query.where("role", "==", filters.role) as any
    }

    if (filters?.status) {
      query = query.where("status", "==", filters.status) as any
    }

    const snapshot = await query.get()
    let users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IUser)

    // Filtro de busca por nome ou email (Firestore não suporta busca de texto completo)
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase()
      users = users.filter(
        (user) => user.nome.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm),
      )
    }

    return users
  }

  async deleteUser(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }

  async getUserStats(): Promise<{
    totalAcolitos: number
    acolitosPendentes: number
    acolitosAtivos: number
  }> {
    const [totalSnapshot, pendentesSnapshot, ativosSnapshot] = await Promise.all([
      this.collection.where("role", "==", "acolito").get(),
      this.collection.where("role", "==", "acolito").where("status", "==", "pendente").get(),
      this.collection.where("role", "==", "acolito").where("status", "==", "ativo").get(),
    ])

    return {
      totalAcolitos: ativosSnapshot.size,
      acolitosPendentes: pendentesSnapshot.size,
      acolitosAtivos: ativosSnapshot.size,
    }
  }
}
