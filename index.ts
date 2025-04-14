import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import { Strategy, GooleStrategy } from 'passport-google-oauth20'



//Configuração de variáveis de ambiente

dotenv.config()

// inicialização do express
const app = express()
const PORT = process.env.PORT || 5000


//Middleware
app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "htpp://localhost:3000",
    credentials: true,
}),
)

// Configuraação da Sessão

app.use(
  session({
      secret: process.env.SESSION_SECRET || "escala-acolitos-backend",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 48 * 60 * 1000,

      },
  }),

)


// Inicialização do Passport
app.use(passport.initialize())
app.use(passport.session())

// Configuração da estratégia Google OAuth
passport.use(
  new GooleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: `${process.env.API_URL || "http://localhost:5000}/auth/google/callback"}`,
    },
      async (acessToken, refreshToken, profile, done) => {
        try {
          // Verificar se o usuário já existe
          let user = await User.findOne({ googleId: profile.id })
          if(!user) {
          //Criar novo usuário se não existir
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            nome: profile.displayName,
            foto: profile.photos?.[0].value,
            role: "acolito", //Por padrão, novos usuários são acólitos
            status: "pendente", // Administrador precisa aprovar
          })
        }
        return done (null, user)
      } catch(error) {
      return done(error as Error)}
      }
  ),
)
// Serialização e deserialização do usuário
passport.serializeUser((user: any, done) => {
    done(null, user.id)
  })





// Rotas
// Rota de status
// Conexão com o MongoDB
//



