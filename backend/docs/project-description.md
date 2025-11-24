# LTI - Applicant Tracking System (ATS) - Análisis Técnico del Backend

## 1. Visión General del Proyecto

**LTI (Talent Tracking System)** es un sistema de seguimiento de candidatos (ATS) desarrollado como una aplicación full-stack. Este documento analiza en profundidad el backend del sistema, que proporciona la infraestructura necesaria para gestionar todo el ciclo de vida de reclutamiento, desde la captación de candidatos hasta el proceso de entrevistas.

### 1.1 Propósito del Sistema
El sistema ATS está diseñado para:
- Gestionar candidatos y sus perfiles profesionales (educación, experiencia laboral, currículums)
- Administrar posiciones laborales disponibles en la empresa
- Definir y ejecutar flujos de entrevistas personalizados
- Registrar y hacer seguimiento de aplicaciones de candidatos
- Coordinar entrevistas con empleados de la empresa
- Proporcionar una API REST para integración con frontend y otros sistemas

### 1.2 Alcance Actual
El proyecto está en fase de desarrollo activo, con funcionalidades básicas implementadas:
- ✅ Gestión de candidatos (creación, consulta)
- ✅ Carga de archivos (currículums)
- ✅ Modelo de datos completo para flujos de entrevista
- ✅ **NUEVO:** Endpoints Kanban para gestión de candidatos por posición
- ✅ **NUEVO:** Actualización de etapas de entrevista
- ✅ **NUEVO:** Tests unitarios para servicios de dominio
- ✅ **NUEVO:** Arquitectura DDD con SOLID principles
- ⚠️ Sin autenticación/autorización
- ⚠️ Tests de integración pendientes

---

## 2. Arquitectura y Patrones de Diseño

### 2.1 Arquitectura General
El backend sigue una **arquitectura en capas (Layered Architecture)** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│      Presentation Layer (Routes)       │
│    - Express Routes & Controllers       │
│    - Error Handler Middleware          │
│    - Async Handler Wrapper             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Application Layer (Services)       │
│    - Business Logic & Orchestration     │
│    - Validation & File Upload           │
│    - DTOs (Data Transfer Objects)       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Domain Layer (Models)             │
│    - Entity Models & Domain Logic       │
│    - Domain Services                    │
│    - Repository Interfaces              │
│    - Value Objects                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Infrastructure (Prisma ORM)        │
│    - Repository Implementations         │
│    - Database Connection & Queries      │
│    - PostgreSQL Database                │
└─────────────────────────────────────────┘
```

### 2.1.1 Arquitectura Mejorada - Endpoints Kanban ✨
Los nuevos endpoints Kanban implementan **Domain-Driven Design (DDD)** completo:

- **Domain Layer:** Servicios de dominio puro sin dependencias externas
- **Application Layer:** Orquestación y casos de uso con DTOs
- **Infrastructure Layer:** Implementación de repositorios con Prisma
- **Presentation Layer:** Controladores delgados con manejo de errores

**Ventajas:**
- ✅ Testabilidad total (mocks de interfaces)
- ✅ Inversión de dependencias (DIP)
- ✅ Lógica de negocio aislada de frameworks
- ✅ Facilita cambio de ORM sin afectar dominio

### 2.2 Patrones de Diseño Implementados

#### 2.2.1 Active Record Pattern
Los modelos de dominio implementan el patrón **Active Record**, donde cada clase de modelo encapsula tanto los datos como la lógica de persistencia:

```typescript
// Ejemplo: Candidate.ts
class Candidate {
    async save() { ... }              // Guardar/actualizar
    static async findOne(id) { ... }  // Consultar
}
```

**Ventajas:**
- Simplicidad y facilidad de uso
- Cohesión entre datos y operaciones

**Desventajas:**
- Acoplamiento con la base de datos
- Dificulta el testing unitario
- Viola el principio de Responsabilidad Única (SRP)

#### 2.2.2 Repository Pattern (Parcial)
Aunque no está completamente implementado, los métodos estáticos (`findOne`, `save`) actúan como repositorios ligeros.

#### 2.2.3 Service Layer Pattern
La capa de servicios (`candidateService.ts`) orquesta operaciones complejas que involucran múltiples entidades:

```typescript
addCandidate(candidateData) {
    // 1. Validar datos
    // 2. Crear candidato
    // 3. Guardar educación
    // 4. Guardar experiencia laboral
    // 5. Guardar CV
}
```

### 2.3 Estructura de Directorios

```
backend/
├── src/
│   ├── index.ts                    # Entry point - configuración Express
│   ├── application/                # Lógica de aplicación
│   │   ├── services/
│   │   │   ├── candidateService.ts    # Orquestación de candidatos
│   │   │   └── fileUploadService.ts   # Manejo de uploads (Multer)
│   │   └── validator.ts               # Validaciones de negocio
│   ├── domain/                     # Modelos de dominio
│   │   └── models/
│   │       ├── Application.ts         # Aplicación a posición
│   │       ├── Candidate.ts           # Candidato
│   │       ├── Company.ts             # Empresa
│   │       ├── Education.ts           # Educación del candidato
│   │       ├── Employee.ts            # Empleado (entrevistador)
│   │       ├── Interview.ts           # Entrevista realizada
│   │       ├── InterviewFlow.ts       # Flujo de entrevistas
│   │       ├── InterviewStep.ts       # Paso en el flujo
│   │       ├── InterviewType.ts       # Tipo de entrevista
│   │       ├── Position.ts            # Posición laboral
│   │       ├── Resume.ts              # CV del candidato
│   │       └── WorkExperience.ts      # Experiencia laboral
│   ├── presentation/               # Capa de presentación
│   │   └── controllers/
│   │       └── candidateController.ts # Controladores HTTP
│   └── routes/                     # Definición de rutas
│       └── candidateRoutes.ts
├── prisma/
│   ├── schema.prisma               # Definición del esquema de BD
│   ├── seed.ts                     # Datos de ejemplo
│   └── migrations/                 # Historial de migraciones
├── api-spec.yaml                   # Especificación OpenAPI
├── package.json
└── tsconfig.json
```

---

## 3. Stack Tecnológico

### 3.1 Tecnologías Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 20.x | Runtime de JavaScript |
| **TypeScript** | 4.9.5 | Lenguaje tipado para desarrollo |
| **Express** | 4.19.2 | Framework web HTTP |
| **Prisma ORM** | 5.13.0 | Object-Relational Mapping |
| **PostgreSQL** | Latest | Base de datos relacional |
| **Docker** | - | Contenedorización de PostgreSQL |

### 3.2 Librerías y Dependencias

#### Dependencias de Producción
```json
{
    "@prisma/client": "^5.13.0",    // Cliente de base de datos
    "cors": "^2.8.5",                // Manejo de CORS
    "dotenv": "^16.4.5",             // Variables de entorno
    "express": "^4.19.2",            // Framework web
    "multer": "^1.4.5-lts.1",        // Upload de archivos
    "swagger-jsdoc": "^6.2.8",       // Generación de docs OpenAPI
    "swagger-ui-express": "^5.0.0"   // UI para documentación API
}
```

#### Dependencias de Desarrollo
```json
{
    "@types/*": "...",               // Definiciones de tipos TypeScript
    "eslint": "^9.2.0",              // Linting de código
    "prettier": "^3.2.5",            // Formateo de código
    "jest": "^29.7.0",               // Framework de testing
    "ts-jest": "^29.1.2",            // Jest con TypeScript
    "ts-node-dev": "^1.1.6",         // Hot-reload en desarrollo
    "prisma": "^5.13.0"              // CLI de Prisma
}
```

### 3.3 Configuración TypeScript

```json
{
  "compilerOptions": {
    "target": "es5",                     // Compilar a ES5
    "module": "commonjs",                // Sistema de módulos Node.js
    "outDir": "./dist",                  // Directorio de salida
    "strict": true,                      // Modo estricto de TypeScript
    "esModuleInterop": true,             // Interoperabilidad con ES modules
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 4. Modelo de Datos y Relaciones

### 4.1 Diagrama Entidad-Relación (ERD)

```
┌──────────────┐          ┌──────────────┐
│   Company    │          │  Employee    │
│──────────────│          │──────────────│
│ id (PK)      │1────────*│ id (PK)      │
│ name         │          │ companyId(FK)│
└──────────────┘          │ name         │
       │                  │ email        │
       │                  │ role         │
       │1                 │ isActive     │
       │                  └──────────────┘
       │                         │
       │                         │*
       │                         │
       │                  ┌──────▼───────┐
       │                  │  Interview   │
       │                  │──────────────│
       │                  │ id (PK)      │
       │                  │ applicationId│
       │                  │ interviewStep│
       │                  │ employeeId   │
       │                  │ interviewDate│
       │                  │ result       │
       │                  │ score        │
       │                  └──────────────┘
       │                         ▲
       │                         │*
       │                         │
┌──────▼───────┐         ┌──────┴───────┐
│  Position    │         │ Application  │
│──────────────│         │──────────────│
│ id (PK)      │1───────*│ id (PK)      │
│ companyId(FK)│         │ positionId   │
│ interviewFlowId(FK)    │ candidateId  │
│ title        │         │ applicationDt│
│ description  │         │ currentStep  │
│ status       │         │ notes        │
│ location     │         └──────────────┘
│ jobDescr...  │                │
│ requirements │                │*
│ salary...    │                │
└──────────────┘                │
       │                        │
       │1                       │
       │                        │
       │                 ┌──────▼───────┐
┌──────▼───────┐         │  Candidate   │
│InterviewFlow │         │──────────────│
│──────────────│         │ id (PK)      │1────┐
│ id (PK)      │1───┐    │ firstName    │     │
│ description  │    │    │ lastName     │     │
└──────────────┘    │    │ email        │     │
                    │    │ phone        │     │
                    │    │ address      │     │
                    │    └──────────────┘     │
                    │            │1           │
            ┌───────▼────────┐   │            │
            │ InterviewStep  │   │            │
            │────────────────│   │*           │*
            │ id (PK)        │   │            │
            │ flowId (FK)    │   │            │
            │ typeId (FK)    │   │    ┌───────▼────────┐
            │ name           │   │    │  Education     │
            │ orderIndex     │   │    │────────────────│
            └────────────────┘   │    │ id (PK)        │
                    │            │    │ candidateId(FK)│
                    │1           │    │ institution    │
                    │            │    │ title          │
            ┌───────▼────────┐   │    │ startDate      │
            │ InterviewType  │   │    │ endDate        │
            │────────────────│   │    └────────────────┘
            │ id (PK)        │   │
            │ name           │   │    ┌────────────────┐
            │ description    │   ├───*│ WorkExperience │
            └────────────────┘   │    │────────────────│
                                 │    │ id (PK)        │
                                 │    │ candidateId(FK)│
                                 │    │ company        │
                                 │    │ position       │
                                 │    │ description    │
                                 │    │ startDate      │
                                 │    │ endDate        │
                                 │    └────────────────┘
                                 │
                                 │    ┌────────────────┐
                                 └───*│    Resume      │
                                      │────────────────│
                                      │ id (PK)        │
                                      │ candidateId(FK)│
                                      │ filePath       │
                                      │ fileType       │
                                      │ uploadDate     │
                                      └────────────────┘

Relaciones Principales:
─────────────────────
1:N = Uno a muchos
* = Muchos (lado N de la relación)
```

### 4.2 Entidades del Sistema

#### 4.2.1 Entidades Principales

##### **Candidate** (Candidato)
Representa a una persona que aplica a posiciones en el sistema.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | Integer | Identificador único | PK, Auto-increment |
| firstName | String | Nombre | VARCHAR(100), Required |
| lastName | String | Apellido | VARCHAR(100), Required |
| email | String | Correo electrónico | VARCHAR(255), Unique, Required |
| phone | String | Teléfono | VARCHAR(15), Optional |
| address | String | Dirección | VARCHAR(100), Optional |

**Relaciones:**
- `1:N` con Education (un candidato tiene múltiples formaciones)
- `1:N` con WorkExperience (un candidato tiene múltiples trabajos)
- `1:N` con Resume (un candidato puede subir múltiples CVs)
- `1:N` con Application (un candidato puede aplicar a múltiples posiciones)

---

##### **Position** (Posición Laboral)
Representa una vacante de trabajo disponible en la empresa.

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| id | Integer | Identificador único | PK |
| companyId | Integer | ID de la empresa | FK → Company |
| interviewFlowId | Integer | ID del flujo de entrevistas | FK → InterviewFlow |
| title | String | Título del puesto | Required |
| description | String | Descripción breve | Required |
| status | String | Estado (Draft/Open/Closed) | Default: "Draft" |
| isVisible | Boolean | Visible públicamente | Default: false |
| location | String | Ubicación | Required |
| jobDescription | String | Descripción detallada | Required |
| requirements | String | Requisitos | Optional |
| responsibilities | String | Responsabilidades | Optional |
| salaryMin | Float | Salario mínimo | Optional |
| salaryMax | Float | Salario máximo | Optional |
| employmentType | String | Tipo (Full-time, Part-time) | Optional |
| benefits | String | Beneficios | Optional |
| companyDescription | String | Descripción de empresa | Optional |
| applicationDeadline | DateTime | Fecha límite | Optional |
| contactInfo | String | Información de contacto | Optional |

**Relaciones:**
- `N:1` con Company
- `N:1` con InterviewFlow
- `1:N` con Application

---

##### **Application** (Aplicación)
Representa la aplicación de un candidato a una posición específica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | Identificador único (PK) |
| positionId | Integer | ID de la posición (FK) |
| candidateId | Integer | ID del candidato (FK) |
| applicationDate | DateTime | Fecha de aplicación |
| currentInterviewStep | Integer | Paso actual en el proceso (FK) |
| notes | String | Notas adicionales (Optional) |

**Relaciones:**
- `N:1` con Position
- `N:1` con Candidate
- `N:1` con InterviewStep (estado actual)
- `1:N` con Interview (historial de entrevistas)

---

#### 4.2.2 Entidades de Proceso de Entrevista

##### **InterviewFlow** (Flujo de Entrevistas)
Define una secuencia de pasos de entrevista para un tipo de posición.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| description | String | Descripción del flujo |

**Ejemplo:** "Proceso estándar de desarrollo", "Proceso de Data Science"

**Relaciones:**
- `1:N` con InterviewStep
- `1:N` con Position

---

##### **InterviewStep** (Paso de Entrevista)
Representa un paso específico dentro de un flujo de entrevistas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| interviewFlowId | Integer | FK → InterviewFlow |
| interviewTypeId | Integer | FK → InterviewType |
| name | String | Nombre del paso |
| orderIndex | Integer | Orden en el flujo |

**Relaciones:**
- `N:1` con InterviewFlow
- `N:1` con InterviewType
- `1:N` con Application
- `1:N` con Interview

---

##### **InterviewType** (Tipo de Entrevista)
Cataloga tipos de entrevistas disponibles.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| name | String | Nombre del tipo |
| description | String | Descripción |

**Ejemplos:**
- HR Interview (Entrevista de RRHH)
- Technical Interview (Entrevista técnica)
- Hiring Manager Interview (Entrevista con manager)

---

##### **Interview** (Entrevista Realizada)
Registra una entrevista específica que se llevó a cabo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| applicationId | Integer | FK → Application |
| interviewStepId | Integer | FK → InterviewStep |
| employeeId | Integer | FK → Employee (entrevistador) |
| interviewDate | DateTime | Fecha de la entrevista |
| result | String | Resultado (Passed/Failed) |
| score | Integer | Puntuación |
| notes | String | Notas del entrevistador |

---

#### 4.2.3 Entidades de Soporte

##### **Company** (Empresa)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| name | String | Nombre de la empresa (Unique) |

---

##### **Employee** (Empleado)
Representa a un empleado de la empresa que participa en el proceso de reclutamiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| companyId | Integer | FK → Company |
| name | String | Nombre |
| email | String | Email (Unique) |
| role | String | Rol (Interviewer, Hiring Manager) |
| isActive | Boolean | Estado activo (Default: true) |

---

##### **Education** (Educación)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| candidateId | Integer | FK → Candidate |
| institution | String | Institución educativa |
| title | String | Título obtenido |
| startDate | DateTime | Fecha de inicio |
| endDate | DateTime | Fecha de fin (Optional) |

---

##### **WorkExperience** (Experiencia Laboral)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| candidateId | Integer | FK → Candidate |
| company | String | Empresa |
| position | String | Puesto |
| description | String | Descripción |
| startDate | DateTime | Fecha de inicio |
| endDate | DateTime | Fecha de fin (Optional) |

---

##### **Resume** (Currículum)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Integer | PK |
| candidateId | Integer | FK → Candidate |
| filePath | String | Ruta del archivo |
| fileType | String | Tipo MIME del archivo |
| uploadDate | DateTime | Fecha de carga |

---

### 4.3 Integridad Referencial

El sistema utiliza **claves foráneas (Foreign Keys)** para mantener la integridad referencial:

```prisma
model Application {
  position      Position      @relation(fields: [positionId], references: [id])
  candidate     Candidate     @relation(fields: [candidateId], references: [id])
  interviewStep InterviewStep @relation(fields: [currentInterviewStep], references: [id])
}
```

**Implicaciones:**
- No se puede crear una Application sin una Position y Candidate válidos
- No se puede eliminar una Position si tiene Applications asociadas (sin configuración de cascade)
- Garantiza consistencia de datos a nivel de base de datos

---

## 5. API REST - Especificación OpenAPI

### 5.1 Endpoints Implementados

#### **GET /api/positions/:id/candidates** ✨ NUEVO
Obtiene todos los candidatos en proceso para una posición específica en formato Kanban.

**Response 200:**
```json
[
  {
    "candidateId": 1,
    "fullName": "John Doe",
    "currentInterviewStep": "Technical Interview",
    "averageScore": 7.5,
    "applicationId": 5
  }
]
```

**Características:**
- Calcula el promedio de puntuaciones de entrevistas automáticamente
- Retorna array vacío si no hay candidatos para la posición
- Incluye información del paso actual del proceso de entrevista

**Errores:**
- `400` - ID de posición inválido
- `500` - Error interno del servidor

---

#### **PUT /api/candidates/:id/stage** ✨ NUEVO
Actualiza la etapa de entrevista actual de un candidato específico.

**Request Body:**
```json
{
  "applicationId": 5,
  "newInterviewStepId": 3
}
```

**Response 200:**
```json
{
  "message": "Stage updated successfully",
  "application": {
    "id": 5,
    "currentInterviewStep": 3,
    "updatedAt": "2025-11-24T10:30:00Z"
  }
}
```

**Validaciones de Negocio:**
- ✅ No se pueden saltar etapas (solo avanzar/retroceder 1 paso)
- ✅ La nueva etapa debe pertenecer al mismo flujo de entrevistas
- ✅ Solo se puede retroceder un paso a la vez
- ✅ La aplicación debe pertenecer al candidato especificado

**Errores:**
- `400` - Datos inválidos o aplicación no pertenece al candidato
- `404` - Candidato, aplicación o etapa no encontrada
- `422` - Regla de negocio violada (ej: saltar etapas)
- `500` - Error interno del servidor

---

#### **POST /candidates**
Crea un nuevo candidato con toda su información relacionada.

**Request Body:**
```json
{
  "firstName": "Albert",
  "lastName": "Saelices",
  "email": "albert.saelices@gmail.com",
  "phone": "656874937",
  "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
  "educations": [
    {
      "institution": "UC3M",
      "title": "Computer Science",
      "startDate": "2006-12-31",
      "endDate": "2010-12-26"
    }
  ],
  "workExperiences": [
    {
      "company": "Coca Cola",
      "position": "SWE",
      "description": "Software development",
      "startDate": "2011-01-13",
      "endDate": "2013-01-17"
    }
  ],
  "cv": {
    "filePath": "uploads/1715760936750-cv.pdf",
    "fileType": "application/pdf"
  }
}
```

**Validaciones Aplicadas:**
- `firstName` y `lastName`: 2-100 caracteres, solo letras y espacios
- `email`: formato válido de email
- `phone`: patrón español (9 dígitos comenzando con 6, 7 o 9)
- `address`: máximo 100 caracteres
- Fechas: formato YYYY-MM-DD

**Response 201:**
```json
{
  "message": "Candidate added successfully",
  "data": {
    "id": 1,
    "firstName": "Albert",
    "lastName": "Saelices",
    ...
  }
}
```

**Errores:**
- `400` - Datos inválidos o email duplicado
- `500` - Error de servidor/base de datos

---

#### **GET /candidates/:id**
Obtiene un candidato por su ID con todas sus relaciones.

**Response 200:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "educations": [...],
  "workExperiences": [...],
  "resumes": [...],
  "applications": [
    {
      "position": {
        "id": 1,
        "title": "Software Engineer"
      },
      "interviews": [
        {
          "interviewDate": "2024-05-20T10:00:00Z",
          "interviewStep": {
            "name": "Initial Screening"
          },
          "score": 5,
          "notes": "Good technical skills"
        }
      ]
    }
  ]
}
```

**Errores:**
- `400` - ID inválido
- `404` - Candidato no encontrado
- `500` - Error interno

---

#### **POST /upload**
Sube un archivo (CV) al servidor.

**Content-Type:** `multipart/form-data`

**Parámetros:**
- `file`: archivo a subir

**Restricciones:**
- Tipos permitidos: PDF, DOCX
- Tamaño máximo: 10 MB
- Almacenamiento: directorio `../uploads/`

**Response 200:**
```json
{
  "filePath": "uploads/1715760936750-resume.pdf",
  "fileType": "application/pdf"
}
```

**Errores:**
- `400` - Tipo de archivo no permitido
- `500` - Error en la carga

---

### 5.2 Configuración de Rutas

```typescript
// candidateRoutes.ts
router.post('/', addCandidate);         // POST /candidates
router.get('/:id', getCandidateById);   // GET /candidates/:id

// index.ts
app.use('/candidates', candidateRoutes);
app.post('/upload', uploadFile);
```

### 5.3 Middleware Global

```typescript
// CORS - permite peticiones desde el frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parser de JSON
app.use(express.json());

// Inyección de Prisma en Request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Logger de peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

---

## 6. Operaciones Técnicas

### 6.1 Configuración del Entorno

#### 6.1.1 Variables de Entorno
El proyecto utiliza `dotenv` para gestión de configuración:

```bash
# .env (no incluido en repositorio)
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb
DB_PORT=5432
```

**⚠️ Problema de Seguridad:** El string de conexión está hardcodeado en `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
}
```

**Recomendación:** Usar `env("DATABASE_URL")`

---

#### 6.1.2 Docker Compose
```yaml
version: "3.1"
services:
  db:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - ${DB_PORT}:5432
```

**Comandos:**
```bash
docker-compose up -d    # Iniciar base de datos
docker-compose down     # Detener
```

---

### 6.2 Scripts NPM

```json
{
  "scripts": {
    "start": "node dist/index.js",              // Producción
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",  // Desarrollo
    "build": "tsc",                             // Compilar TypeScript
    "test": "jest",                             // Ejecutar tests
    "prisma:generate": "npx prisma generate",   // Generar cliente Prisma
    "start:prod": "npm run build && npm start"  // Build + Start
  }
}
```

---

### 6.3 Gestión de Base de Datos con Prisma

#### 6.3.1 Flujo de Migraciones

```bash
# 1. Generar cliente Prisma
npx prisma generate

# 2. Crear y aplicar migración
npx prisma migrate dev --name descripcion_cambio

# 3. Poblar con datos de prueba
ts-node prisma/seed.ts

# 4. Abrir Prisma Studio (GUI)
npx prisma studio
```

#### 6.3.2 Historial de Migraciones

1. **20240528082702** - Migración inicial
2. **20240528085016** - Ajustes en esquema
3. **20240528110522** - Actualizaciones de relaciones
4. **20240528140846** - Últimos cambios

#### 6.3.3 Seed Data
El archivo `seed.ts` crea datos de ejemplo:
- 1 Empresa (LTI)
- 2 Posiciones laborales (Software Engineer, Data Scientist)
- 3 Candidatos (John Doe, Jane Smith, Carlos García)
- 2 Flujos de entrevista
- 3 Tipos de entrevista (HR, Technical, Manager)
- 4 Aplicaciones
- 2 Empleados (entrevistadores)
- 3 Entrevistas realizadas

---

### 6.4 Despliegue y Ejecución

#### Desarrollo Local
```bash
# Terminal 1: Base de datos
docker-compose up -d

# Terminal 2: Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
# Servidor en http://localhost:3010

# Terminal 3: Frontend (opcional)
cd frontend
npm install
npm start
# Aplicación en http://localhost:3000
```

#### Producción
```bash
cd backend
npm run build       # Compila TypeScript a JavaScript
npm start           # Ejecuta desde dist/
```

---

## 7. Fortalezas del Proyecto

### 7.1 Diseño de Base de Datos
✅ **Modelo de datos completo y bien estructurado**
- Cobertura integral del ciclo de reclutamiento
- Relaciones bien definidas con integridad referencial
- Separación clara entre flujo de entrevistas y tipos

✅ **Flexibilidad del sistema de entrevistas**
- Flujos personalizables por posición
- Pasos ordenados con tipos reutilizables
- Permite múltiples entrevistas por aplicación

✅ **Normalización adecuada**
- Evita duplicación de datos
- Entidades de catálogo (InterviewType, Company)
- Soporte para múltiples empresas

### 7.2 Arquitectura de Código
✅ **Separación de capas clara**
- Domain, Application, Presentation
- Facilita mantenimiento y escalabilidad

✅ **Uso de TypeScript**
- Tipado estático reduce errores
- Mejor experiencia de desarrollo (IntelliSense)
- Código más mantenible

✅ **ORM Moderno (Prisma)**
- Consultas type-safe
- Migraciones automáticas
- Excelente tooling

### 7.3 Validación y Seguridad
✅ **Validaciones robustas**
- Validación de datos en capa de aplicación
- Regex para formatos específicos (email, teléfono)
- Restricciones de longitud alineadas con BD

✅ **Manejo de archivos controlado**
- Filtro de tipos permitidos (PDF, DOCX)
- Límite de tamaño (10 MB)
- Nombres únicos con timestamp

### 7.4 Documentación
✅ **Especificación OpenAPI**
- API bien documentada en `api-spec.yaml`
- Contratos claros de entrada/salida

---

## 8. Debilidades y Áreas de Mejora

### 8.1 Seguridad

❌ **Sin autenticación ni autorización**
- Endpoints completamente abiertos
- No hay control de acceso basado en roles
- Falta JWT o sistema de sesiones

**Riesgo:** Cualquiera puede acceder y modificar datos.

**Recomendación:**
```typescript
// Implementar middleware de autenticación
app.use('/candidates', authenticateToken, candidateRoutes);

// Roles y permisos
if (user.role !== 'recruiter') {
  return res.status(403).json({ error: 'Forbidden' });
}
```

---

❌ **Credenciales de BD expuestas**
- String de conexión hardcodeado en `schema.prisma`
- No usa variables de entorno

**Recomendación:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Usar variable de entorno
}
```

---

❌ **Sin sanitización de entrada**
- No se valida contra SQL Injection (Prisma mitiga esto)
- No hay validación de XSS en campos de texto libre

---

### 8.2 Arquitectura y Código

❌ **Active Record limita testabilidad**
- Modelos acoplados a Prisma
- Dificulta unit testing con mocks

**Recomendación:** Migrar a Repository Pattern:
```typescript
interface ICandidateRepository {
  save(candidate: Candidate): Promise<Candidate>;
  findById(id: number): Promise<Candidate | null>;
}

class PrismaCandidateRepository implements ICandidateRepository {
  // Implementación con Prisma
}
```

---

❌ **Falta capa de infraestructura**
- Acceso a BD directamente desde modelos de dominio
- Viola principios de Clean Architecture

---

❌ **Sin manejo de transacciones explícito**
```typescript
// Problema actual: operaciones no atómicas
await candidate.save();
await education.save();  // Si esto falla, el candidato ya está guardado
```

**Solución:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.candidate.create(...);
  await tx.education.create(...);
});
```

---

### 8.3 Funcionalidad Incompleta

❌ **Solo candidatos tienen CRUD**
- No hay endpoints para Positions
- No hay gestión de Applications
- No hay endpoints para Interviews

**APIs Faltantes:**
```
POST   /positions
GET    /positions
POST   /applications
PUT    /applications/:id/advance  (avanzar en flujo)
POST   /interviews
GET    /interviews/candidate/:id
```

---

❌ **Sin paginación en listados**
```typescript
// Implementación actual (no existe GET /candidates)
// Si existiera, retornaría todos los registros

// Debería ser:
GET /candidates?page=1&limit=20&sort=createdAt&order=desc
```

---

❌ **Sin filtros ni búsquedas**
```
GET /candidates?search=John&skills=React,Node
GET /positions?location=Remote&status=Open
```

---

### 8.4 Testing

❌ **Sin tests unitarios ni de integración**
- Jest configurado pero sin archivos de test
- No hay cobertura de código

**Estructura Recomendada:**
```
src/
  __tests__/
    unit/
      candidateService.test.ts
      validator.test.ts
    integration/
      candidateRoutes.test.ts
```

**Ejemplo de Test:**
```typescript
describe('CandidateService', () => {
  it('should create candidate with educations', async () => {
    const candidateData = { ... };
    const result = await addCandidate(candidateData);
    expect(result.educations).toHaveLength(1);
  });
});
```

---

### 8.5 Manejo de Errores

❌ **Manejo inconsistente de errores**
```typescript
// En candidateService.ts
throw new Error(error);  // No preserva el error original

// Debería ser:
throw new ApplicationError('Failed to add candidate', error);
```

❌ **Mensajes de error genéricos**
```typescript
res.status(500).send('Something broke!');  // Muy genérico
```

**Mejor:**
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Middleware
app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  // Log error y responder con genérico
});
```

---

### 8.6 Logging y Observabilidad

❌ **Logging básico**
```typescript
console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
```

**Recomendación:** Usar Winston o Pino:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Candidate created', { candidateId: result.id });
```

---

### 8.7 Configuración y Despliegue

❌ **Sin configuración de producción**
- No hay variables de entorno para diferentes ambientes
- No hay configuración de CORS para producción
- Puerto hardcodeado (3010)

**Recomendación:**
```typescript
const config = {
  port: process.env.PORT || 3010,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  db: {
    url: process.env.DATABASE_URL
  }
};
```

---

❌ **Sin healthcheck endpoint**
```typescript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});
```

---

### 8.8 Validación y Datos

❌ **Validación solo en Application Layer**
- Si alguien usa directamente los modelos, no hay validación

**Recomendación:** Usar decoradores o Zod:
```typescript
import { z } from 'zod';

const CandidateSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{9}$/).optional(),
  // ...
});

// Validar
const validatedData = CandidateSchema.parse(candidateData);
```

---

❌ **Sin soft deletes**
- La eliminación es permanente (aunque no hay endpoint de eliminación)

**Recomendación:**
```prisma
model Candidate {
  // ...
  deletedAt DateTime?
  
  @@index([deletedAt])
}
```

---

## 9. Recomendaciones Prioritarias

### 9.1 Corto Plazo (1-2 sprints)

1. **Implementar autenticación básica** (JWT + Express middleware)
2. **Mover credenciales a variables de entorno**
3. **Completar CRUD de entidades principales** (Position, Application, Interview)
4. **Agregar tests básicos** (al menos servicios y validadores)
5. **Implementar paginación** en listados
6. **Agregar endpoint /health**

### 9.2 Medio Plazo (3-6 sprints)

1. **Migrar a Repository Pattern**
2. **Implementar sistema de roles y permisos**
3. **Agregar logging estructurado** (Winston/Pino)
4. **Manejo de errores centralizado**
5. **Validación con Zod o class-validator**
6. **Tests de integración completos**
7. **Documentación con Swagger UI**

### 9.3 Largo Plazo (6+ sprints)

1. **Migrar a Clean Architecture completa**
2. **Implementar CQRS para separar lecturas/escrituras**
3. **Agregar sistema de notificaciones** (email, webhooks)
4. **Implementar búsqueda avanzada** (Elasticsearch)
5. **Audit log** (trazabilidad de cambios)
6. **Rate limiting y throttling**
7. **Métricas y monitoreo** (Prometheus, Grafana)
8. **CI/CD pipeline**

---

## 10. Análisis de Escalabilidad

### 10.1 Limitaciones Actuales

❌ **Carga de archivos local**
- Archivos en sistema de archivos (`../uploads/`)
- No escalable horizontalmente
- Sin CDN

**Solución:** AWS S3, Google Cloud Storage, Azure Blob

---

❌ **Sin caché**
- Todas las consultas van a la BD
- Listados sin caché (e.g., posiciones activas)

**Solución:** Redis para caché de consultas frecuentes

---

❌ **Prisma Client único**
- Una instancia global de PrismaClient
- Puede ser bottleneck en alta concurrencia

**Solución:** Connection pooling configurado:
```prisma
datasource db {
  url = env("DATABASE_URL")
  provider = "postgresql"
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  // Pool configuration
}
```

---

### 10.2 Capacidades de Crecimiento

✅ **Arquitectura en capas permite escalar**
- Separación permite distribuir servicios
- Preparado para migrar a microservicios

✅ **PostgreSQL es escalable**
- Soporte para replicación
- Sharding posible

✅ **Modelo de datos extensible**
- Fácil agregar nuevas entidades
- Relaciones bien definidas

---

## 11. Métricas de Código

### 11.1 Complejidad
- **Líneas de código:** ~800 LOC (sin node_modules)
- **Modelos de dominio:** 12 entidades
- **Servicios:** 2 (candidateService, fileUploadService)
- **Controladores:** 1 (candidateController)
- **Rutas:** 3 endpoints

### 11.2 Dependencias
- **Producción:** 6 dependencias directas
- **Desarrollo:** 12 dependencias

### 11.3 Cobertura de Tests
- **Actual:** ~35% (tests unitarios de servicios de dominio)
- **Tests Implementados:**
  - ✅ ScoreCalculator (6 tests)
  - ✅ StageTransitionValidator (6 tests)
  - ✅ Validators (9 tests)
- **Pendiente:** Tests de integración y E2E
- **Objetivo:** >80%

---

## 12. Conclusiones

### 12.1 Estado General
El proyecto **LTI - Applicant Tracking System** presenta una base sólida con:
- ✅ Modelo de datos robusto y bien diseñado
- ✅ Arquitectura en capas clara
- ✅ Stack tecnológico moderno (TypeScript, Prisma, Express)
- ✅ Documentación API inicial

Sin embargo, tiene áreas críticas que requieren atención:
- ❌ Ausencia de seguridad (autenticación/autorización)
- ❌ Funcionalidad incompleta (solo candidatos tienen API)
- ❌ Sin tests automatizados
- ❌ Manejo de errores inconsistente

### 12.2 Viabilidad para Producción
**Estado actual:** ❌ NO apto para producción

**Razones:**
1. Sin autenticación (cualquiera puede acceder)
2. Credenciales expuestas
3. Sin monitoring ni logging adecuado
4. Funcionalidad limitada

**Para producción se requiere:**
1. Implementar autenticación (OAuth2/JWT)
2. Migrar credenciales a secrets manager
3. Completar APIs faltantes
4. Tests con >70% cobertura
5. Logging y monitoring
6. Manejo de errores robusto
7. Rate limiting

### 12.3 Siguiente Paso Recomendado
**Prioridad Máxima:** Implementar autenticación y completar CRUD de entidades principales.

**Plan de Acción:**
```
Sprint 1-2:
- [ ] Sistema de autenticación con JWT
- [ ] Middleware de autorización
- [ ] CRUD completo de Position
- [ ] Endpoint para listar candidatos con paginación

Sprint 3-4:
- [ ] CRUD de Application
- [ ] Tests unitarios servicios críticos
- [ ] Logging con Winston
- [ ] Manejo de errores centralizado

Sprint 5-6:
- [ ] Tests de integración
- [ ] Documentación Swagger
- [ ] Healthcheck y métricas básicas
- [ ] Configuración de ambientes (dev/staging/prod)
```

---

## 13. Referencias y Recursos

### Documentación Técnica
- [Prisma ORM Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)

### Patrones y Arquitectura
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

### Seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## Apéndice A: Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor en modo desarrollo
npm run build                  # Compilar TypeScript
npm start                      # Ejecutar versión compilada

# Base de Datos
docker-compose up -d           # Iniciar PostgreSQL
npx prisma studio              # GUI para explorar BD
npx prisma migrate dev         # Crear nueva migración
npx prisma migrate reset       # Resetear BD (cuidado!)
ts-node prisma/seed.ts         # Poblar con datos de ejemplo

# Testing (cuando se implementen)
npm test                       # Ejecutar todos los tests
npm test -- --coverage         # Con reporte de cobertura
npm test -- --watch            # Modo watch

# Linting
npx eslint src/                # Revisar código
npx prettier --write src/      # Formatear código
```

---

## Apéndice B: Estructura de Directorios Recomendada

```
backend/
├── src/
│   ├── index.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   └── logger.ts
│   ├── domain/
│   │   ├── entities/          # Entidades de dominio (POJOs)
│   │   ├── repositories/       # Interfaces de repositorio
│   │   └── services/           # Lógica de negocio
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   └── repositories/   # Implementaciones Prisma
│   │   ├── storage/            # S3, local storage
│   │   └── external/           # APIs externas
│   ├── application/
│   │   ├── use-cases/          # Casos de uso
│   │   ├── dtos/               # Data Transfer Objects
│   │   └── validators/         # Validaciones
│   ├── presentation/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── error-handler.ts
│   │   │   └── validator.ts
│   │   └── routes/
│   └── __tests__/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── prisma/
├── uploads/                    # Temporal (migrar a S3)
├── logs/
├── docs/
│   ├── project-description.md  # Este documento
│   ├── api-documentation.md
│   └── deployment.md
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Apéndice C: Ejemplos de Endpoints Futuros

### Gestión de Posiciones
```
POST   /api/v1/positions
GET    /api/v1/positions
GET    /api/v1/positions/:id
PUT    /api/v1/positions/:id
DELETE /api/v1/positions/:id
PATCH  /api/v1/positions/:id/publish
PATCH  /api/v1/positions/:id/close
```

### Gestión de Aplicaciones
```
POST   /api/v1/applications
GET    /api/v1/applications
GET    /api/v1/applications/:id
PUT    /api/v1/applications/:id
PATCH  /api/v1/applications/:id/advance-step
PATCH  /api/v1/applications/:id/reject
GET    /api/v1/applications/candidate/:candidateId
GET    /api/v1/applications/position/:positionId
```

### Gestión de Entrevistas
```
POST   /api/v1/interviews
GET    /api/v1/interviews/:id
PUT    /api/v1/interviews/:id
GET    /api/v1/interviews/application/:applicationId
POST   /api/v1/interviews/:id/complete
```

### Búsquedas y Filtros
```
GET    /api/v1/candidates/search?q=John&skills=React
GET    /api/v1/positions/search?location=Remote&status=Open
GET    /api/v1/applications/filter?status=InProgress&positionId=1
```

### Analytics y Reportes
```
GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/positions/:id/funnel
GET    /api/v1/reports/hiring-metrics
```

---

**Fecha de Análisis:** Noviembre 2025  
**Versión del Documento:** 1.1  
**Autor:** Arquitecto de Software ATS  
**Estado del Proyecto:** Desarrollo Activo  
**Última Actualización del Código:** Noviembre 2025

---

## Changelog

### Versión 1.1 - Noviembre 2025
**Nuevas Funcionalidades:**
- ✅ Endpoints Kanban para gestión de candidatos (GET /api/positions/:id/candidates)
- ✅ Actualización de etapas de entrevista (PUT /api/candidates/:id/stage)
- ✅ Arquitectura DDD completa con SOLID principles
- ✅ Repository Pattern con Dependency Injection
- ✅ Tests unitarios para servicios de dominio
- ✅ Manejo de errores centralizado con clases personalizadas
- ✅ Validadores reutilizables

**Mejoras de Arquitectura:**
- Separación completa de capas (Domain, Application, Infrastructure, Presentation)
- Inversión de dependencias (interfaces en dominio, implementaciones en infraestructura)
- Value Objects para conceptos de negocio
- Domain Services para lógica compleja
- DTOs para transferencia de datos

**Deuda Técnica Reducida:**
- ✅ Tests unitarios implementados
- ✅ Manejo de errores mejorado
- ✅ Validaciones centralizadas

