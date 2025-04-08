# Escala de Acólitos - Backend

API RESTful para o sistema de gerenciamento de escala para acólitos e coroinhas de igrejas católicas, desenvolvido com Node.js, Express, TypeScript e MongoDB.

## 📋 Sobre o Projeto

Este é o backend para o sistema Escala de Acólitos, responsável por gerenciar usuários, autenticação, escalas e todas as operações de dados. O sistema permite o cadastro de acólitos, criação de escalas para missas e celebrações, e oferece áreas específicas para administradores e acólitos.

## 🚀 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/) - Ambiente de execução JavaScript
- [Express](https://expressjs.com/) - Framework web para Node.js
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [MongoDB](https://www.mongodb.com/) - Banco de dados NoSQL
- [Mongoose](https://mongoosejs.com/) - ODM para MongoDB
- [Passport.js](http://www.passportjs.org/) - Middleware de autenticação
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Autenticação via Google

## 🏗️ Estrutura do Projeto

├── backend/                   # Código do backend (Node.js/Express)
│   ├── src/                   # Código fonte
│   │   ├── controllers/       # Controladores da API
│   │   │   ├── admin.controller.ts    # Controlador para administradores
│   │   │   ├── acolito.controller.ts  # Controlador para acólitos
│   │   │   ├── auth.controller.ts     # Controlador de autenticação
│   │   │   └── escala.controller.ts   # Controlador de escalas
│   │   ├── middleware/        # Middleware Express
│   │   │   └── auth.middleware.ts     # Middleware de autenticação
│   │   ├── models/            # Modelos do MongoDB
│   │   │   ├── escala.model.ts        # Modelo de escala
│   │   │   └── user.model.ts          # Modelo de usuário
│   │   ├── routes/            # Rotas da API
│   │   │   ├── admin.routes.ts        # Rotas de administrador
│   │   │   ├── acolito.routes.ts      # Rotas de acólito
│   │   │   ├── auth.routes.ts         # Rotas de autenticação
│   │   │   └── escala.routes.ts       # Rotas de escala
│   │   └── index.ts           # Ponto de entrada da aplicação
│   ├── dist/                  # Código compilado (gerado pelo TypeScript)
│   ├── .env                   # Variáveis de ambiente
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   ├── tsconfig.json          # Configuração do TypeScript
│   └── package.json           # Dependências e scripts
│
└── README.md                  # Documentação do projeto





## Endpoints da API

### Autenticação

- `GET /auth/google` - Iniciar autenticação com Google
- `GET /auth/google/callback` - Callback do Google após autenticação
- `GET /auth/me` - Obter usuário atual
- `POST /auth/logout` - Logout


### Acólitos (Usuários autenticados com role=acolito)

- `GET /api/acolitos/perfil` - Obter perfil do acólito
- `PUT /api/acolitos/perfil` - Atualizar perfil do acólito
- `GET /api/acolitos/escalas` - Obter escalas do acólito
- `GET /api/acolitos/escalas/:id` - Obter escala específica
- `PUT /api/acolitos/escalas/:id/responder` - Responder a uma escala


### Administração (Usuários autenticados com role=admin)

- `GET /api/admin/dashboard` - Obter dados para o dashboard
- `GET /api/admin/acolitos` - Obter todos os acólitos
- `GET /api/admin/acolitos/:id` - Obter acólito por ID
- `PUT /api/admin/acolitos/:id` - Atualizar acólito
- `PUT /api/admin/acolitos/:id/status` - Atualizar status do acólito
- `POST /api/admin/escalas` - Criar nova escala
- `GET /api/admin/escalas` - Obter todas as escalas
- `GET /api/admin/escalas/:id` - Obter escala por ID
- `PUT /api/admin/escalas/:id` - Atualizar escala
- `DELETE /api/admin/escalas/:id` - Excluir escala


### Escalas (Todos os usuários autenticados)

- `GET /api/escalas` - Obter escalas (visão limitada)
- `GET /api/escalas/:id` - Obter escala específica (visão limitada)


## 🔒 Autenticação e Autorização

O sistema utiliza Passport.js com estratégia Google OAuth 2.0 para autenticação. As sessões são mantidas via cookies.

### Middlewares de Autorização

- `isAuthenticated` - Verifica se o usuário está autenticado
- `isAdmin` - Verifica se o usuário é um administrador
- `isAcolito` - Verifica se o usuário é um acólito
- `isActive` - Verifica se o usuário está ativo



## Modelos de Dados

### User (Usuário/Acólito)


{
  googleId: string;         // ID do Google
  email: string;            // Email do usuário
  nome: string;             // Nome completo
  telefone?: string;        // Telefone de contato
  dataNascimento?: Date;    // Data de nascimento
  tipo?: "acolito" | "coroinha"; // Tipo de servidor
  role: "admin" | "acolito"; // Papel no sistema
  status: "ativo" | "inativo" | "pendente"; // Status da conta
  foto?: string;            // URL da foto de perfil
  createdAt: Date;          // Data de criação
  updatedAt: Date;          // Data de atualização
}

## Escala



{
  data: Date;               // Data da celebração
  hora: string;             // Hora da celebração
  tipo: "Missa" | "Adoração" | "Outro"; // Tipo de celebração
  local: string;            // Local da celebração
  descricao?: string;       // Descrição adicional
  status: "agendada" | "pendente" | "concluida" | "cancelada"; // Status da escala
  acolitos: [               // Lista de acólitos escalados
    {
      acolito: ObjectId;    // Referência ao usuário
      status: "confirmado" | "pendente" | "recusado"; // Status de confirmação
      observacao?: string;  // Observação do acólito
    }
  ];
  createdAt: Date;          // Data de criação
  updatedAt: Date;          // Data de atualização
}