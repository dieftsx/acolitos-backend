import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

// Importar configuração do Firebase
import "./config/firebase"

// Importar rotas
import authRoutes from "./routes/auth.routes"
import acolitoRoutes from "./routes/acolito.routes"
import escalaRoutes from "./routes/escala.routes"
import adminRoutes from "./routes/admin.routes"

// Configuração de variáveis de ambiente
dotenv.config()

// Inicialização do app Express
const app = express()
const PORT = process.env.PORT || 8080

// Middleware de segurança
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela de tempo
  message: "Muitas requisições deste IP, tente novamente em 15 minutos.",
})
app.use(limiter)

// Middleware básico
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL || "https://escala-acolitos.web.app"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rotas
app.use("/auth", authRoutes)
app.use("/api/acolitos", acolitoRoutes)
app.use("/api/escalas", escalaRoutes)
app.use("/api/admin", adminRoutes)

// Rota de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Escala de Acólitos",
    version: "1.0.0",
    status: "online",
  })
})

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erro não tratado:", err)
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  })
})

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  })
})

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
})

export default app
