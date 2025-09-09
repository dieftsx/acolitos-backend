import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  id: string
  uid: string // Firebase Auth UID
  email: string
  nome: string
  telefone?: string
  dataNascimento?: string // ISO string
  tipo?: "acolito" | "coroinha"
  role: "admin" | "acolito"
  status: "ativo" | "inativo" | "pendente"
  foto?: string
  parishId?: string // Para futuras expansões multi-paróquia
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface CreateUserData {
  uid: string
  email: string
  nome: string
  foto?: string
  role?: "admin" | "acolito"
  status?: "ativo" | "inativo" | "pendente"
}

export interface UpdateUserData {
  nome?: string
  telefone?: string
  dataNascimento?: string
  tipo?: "acolito" | "coroinha"
  status?: "ativo" | "inativo" | "pendente"
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    nome: {
      type: String,
      required: true,
    },
    telefone: {
      type: String,
    },
    dataNascimento: {
      type: String,
    },
    tipo: {
      type: String,
      enum: ["acolito", "coroinha"],
      default: "acolito",
    },
    role: {
      type: String,
      enum: ["admin", "acolito"],
      default: "acolito",
    },
    status: {
      type: String,
      enum: ["ativo", "inativo", "pendente"],
      default: "pendente",
    },
    foto: {
      type: String,
    },
    parishId: {
      type: String,
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export const User = mongoose.model<IUser>("User", userSchema)
