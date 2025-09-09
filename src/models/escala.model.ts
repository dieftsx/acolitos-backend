import mongoose, { type Document, Schema } from "mongoose"

export interface IEscala extends Document {
  id: string
  data: string // ISO string
  hora: string
  tipo: "Missa" | "Adoração" | "Outro"
  local: string
  descricao?: string
  status: "agendada" | "pendente" | "concluida" | "cancelada"
  acolitos: {
    acolitoId: string
    status: "confirmado" | "pendente" | "recusado"
    observacao?: string
  }[]
  parishId?: string // Para futuras expansões
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface CreateEscalaData {
  data: string
  hora: string
  tipo: "Missa" | "Adoração" | "Outro"
  local: string
  descricao?: string
  acolitos: {
    acolitoId: string
    status?: "confirmado" | "pendente" | "recusado"
  }[]
}

export interface UpdateEscalaData {
  data?: string
  hora?: string
  tipo?: "Missa" | "Adoração" | "Outro"
  local?: string
  descricao?: string
  status?: "agendada" | "pendente" | "concluida" | "cancelada"
  acolitos?: {
    acolitoId: string
    status: "confirmado" | "pendente" | "recusado"
    observacao?: string
  }[]
}

const escalaSchema = new Schema<IEscala>(
  {
    data: {
      type: String,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["Missa", "Adoração", "Outro"],
      default: "Missa",
    },
    local: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
    },
    status: {
      type: String,
      enum: ["agendada", "pendente", "concluida", "cancelada"],
      default: "pendente",
    },
    acolitos: [
      {
        acolitoId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["confirmado", "pendente", "recusado"],
          default: "pendente",
        },
        observacao: {
          type: String,
        },
      },
    ],
    parishId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export const Escala = mongoose.model<IEscala>("Escala", escalaSchema)
