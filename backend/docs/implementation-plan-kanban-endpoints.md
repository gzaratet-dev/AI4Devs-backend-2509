# Plan de Implementación - Endpoints Kanban para ATS

## 1. Resumen Ejecutivo

### Objetivo
Implementar dos endpoints REST que permitan manipular la lista de candidatos en una interfaz tipo Kanban, facilitando la visualización y gestión del proceso de entrevistas.

### Endpoints a Implementar

#### 1.1 GET /positions/:id/candidates
Obtiene todos los candidatos en proceso para una posición específica.

**Response esperado:**
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

#### 1.2 PUT /candidates/:id/stage
Actualiza la etapa de entrevista actual de un candidato específico.

**Request body:**
```json
{
  "applicationId": 5,
  "newInterviewStepId": 3
}
```

---

## 2. Análisis del Dominio

### 2.1 Entidades Principales Involucradas

| Entidad | Propósito en los Endpoints | Campos Relevantes |
|---------|---------------------------|-------------------|
| **Position** | Filtrar candidatos por posición | `id`, `title` |
| **Application** | Enlace entre Candidate y Position | `positionId`, `candidateId`, `currentInterviewStep` |
| **Candidate** | Información del candidato | `id`, `firstName`, `lastName` |
| **Interview** | Historial de entrevistas con puntuaciones | `applicationId`, `score`, `interviewStepId` |
| **InterviewStep** | Etapa actual del proceso | `id`, `name`, `orderIndex` |

### 2.2 Relaciones Clave

```
Position (1) ──────< Application (N) ────── Candidate (1)
                         │
                         └──────< Interview (N)
                         │
                    InterviewStep (1)
```

---

## 3. Diseño Basado en Domain-Driven Design (DDD)

### 3.1 Identificación de Agregados

#### **Agregado: Application (Raíz de Agregado)**

La `Application` es el agregado raíz porque:
- Coordina la relación entre Candidate y Position
- Mantiene el estado del proceso de entrevista (`currentInterviewStep`)
- Garantiza la consistencia del proceso de cambio de etapa

**Invariantes del Agregado:**
- Un candidato no puede estar en una etapa que no pertenezca al flujo de la posición
- Solo se puede avanzar a etapas válidas según el `orderIndex`
- No se puede cambiar de etapa si hay entrevistas pendientes

#### **Value Objects Propuestos**

##### 3.1.1 CandidateKanbanCard (Value Object)
Representa la información de un candidato en el tablero Kanban.

```typescript
interface CandidateKanbanCard {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number | null;
  applicationId: number;
}
```

**Justificación DDD:**
- No tiene identidad propia (es una vista derivada)
- Es inmutable
- Expresa un concepto del dominio (tarjeta del Kanban)

##### 3.1.2 StageTransition (Value Object)
Representa una transición de etapa en el proceso.

```typescript
interface StageTransition {
  applicationId: number;
  fromStepId: number;
  toStepId: number;
  transitionDate: Date;
}
```

**Justificación DDD:**
- Encapsula la lógica de validación de transiciones
- Es inmutable
- Representa un concepto de negocio

### 3.2 Servicios de Dominio

#### 3.2.1 KanbanService (Domain Service)
Orquesta operaciones complejas que no pertenecen naturalmente a una única entidad.

**Responsabilidades:**
- Calcular el promedio de puntuaciones de un candidato
- Validar transiciones de etapa según reglas de negocio
- Obtener candidatos agrupados por posición

**Justificación:**
- La lógica de calcular promedios involucra múltiples entrevistas
- La validación de transiciones requiere conocer el flujo completo
- No pertenece a Candidate ni a Application exclusivamente

### 3.3 Repositorios (Interfaces)

Aunque el proyecto usa Active Record, definiremos interfaces de repositorio para seguir DDD:

```typescript
interface IApplicationRepository {
  findByPositionId(positionId: number): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
  updateInterviewStep(applicationId: number, newStepId: number): Promise<Application>;
}

interface IInterviewRepository {
  findByApplicationId(applicationId: number): Promise<Interview[]>;
  calculateAverageScore(applicationId: number): Promise<number | null>;
}
```

**Ventajas:**
- Desacopla la lógica de negocio del ORM
- Facilita testing con mocks
- Permite cambiar de Prisma a otro ORM sin afectar servicios

---

## 4. Aplicación de Principios SOLID

### 4.1 Single Responsibility Principle (SRP)

#### **Antes (Antipatrón)**
```typescript
// Un controlador que hace todo
export const getPositionCandidates = async (req: Request, res: Response) => {
  const positionId = parseInt(req.params.id);
  
  // Validación
  if (isNaN(positionId)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  
  // Lógica de negocio
  const applications = await prisma.application.findMany({
    where: { positionId },
    include: { candidate: true, interviews: true }
  });
  
  // Transformación de datos
  const result = applications.map(app => ({
    candidateId: app.candidate.id,
    fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
    averageScore: app.interviews.reduce((sum, i) => sum + (i.score || 0), 0) / app.interviews.length
  }));
  
  res.json(result);
};
```

**Problemas:**
- Mezcla validación, lógica de negocio y presentación
- Dificulta testing
- Viola SRP (múltiples razones para cambiar)

#### **Después (Aplicando SRP)**

**1. Controller (Presentation Layer)**
```typescript
export const getPositionCandidates = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    const candidates = await kanbanService.getCandidatesByPosition(positionId);
    res.json(candidates);
  } catch (error) {
    handleError(error, res);
  }
};
```
**Responsabilidad única:** Manejar la petición HTTP y delegar al servicio.

**2. Service (Application Layer)**
```typescript
export const getCandidatesByPosition = async (positionId: number) => {
  validatePositionId(positionId);
  const applications = await applicationRepository.findByPositionId(positionId);
  return await Promise.all(
    applications.map(app => kanbanDomainService.buildKanbanCard(app))
  );
};
```
**Responsabilidad única:** Orquestar la lógica de negocio.

**3. Domain Service**
```typescript
class KanbanDomainService {
  async buildKanbanCard(application: Application): Promise<CandidateKanbanCard> {
    const candidate = await candidateRepository.findById(application.candidateId);
    const step = await interviewStepRepository.findById(application.currentInterviewStep);
    const averageScore = await interviewRepository.calculateAverageScore(application.id);
    
    return {
      candidateId: candidate.id,
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      currentInterviewStep: step.name,
      averageScore,
      applicationId: application.id
    };
  }
}
```
**Responsabilidad única:** Construir el Value Object del dominio.

**Explicación:**
- Cada clase tiene una única razón para cambiar
- Controller cambia si cambia el protocolo HTTP
- Service cambia si cambia la orquestación
- Domain Service cambia si cambian las reglas de negocio

---

### 4.2 Open/Closed Principle (OCP)

#### **Antes**
```typescript
export const updateCandidateStage = async (candidateId: number, newStageId: number) => {
  // Lógica hardcodeada para validar transiciones
  if (currentStage === 1 && newStageId !== 2) {
    throw new Error('Can only move to stage 2');
  }
  if (currentStage === 2 && newStageId !== 3) {
    throw new Error('Can only move to stage 3');
  }
  // ... más validaciones hardcodeadas
};
```

**Problema:** Agregar nuevas reglas de transición requiere modificar el código existente.

#### **Después (Aplicando OCP)**

**1. Definir interfaz para reglas de validación**
```typescript
interface IStageTransitionRule {
  canTransition(from: InterviewStep, to: InterviewStep): boolean;
  getReason(): string;
}
```

**2. Implementar reglas específicas**
```typescript
class SequentialTransitionRule implements IStageTransitionRule {
  canTransition(from: InterviewStep, to: InterviewStep): boolean {
    return to.orderIndex === from.orderIndex + 1 || to.orderIndex === from.orderIndex - 1;
  }
  
  getReason(): string {
    return 'Can only move to adjacent stages';
  }
}

class NoSkipStagesRule implements IStageTransitionRule {
  canTransition(from: InterviewStep, to: InterviewStep): boolean {
    return Math.abs(to.orderIndex - from.orderIndex) <= 1;
  }
  
  getReason(): string {
    return 'Cannot skip stages';
  }
}

// Futura regla sin modificar código existente
class RequireInterviewCompletionRule implements IStageTransitionRule {
  constructor(private interviewRepository: IInterviewRepository) {}
  
  async canTransition(from: InterviewStep, to: InterviewStep): Promise<boolean> {
    const interviews = await this.interviewRepository.findByStepId(from.id);
    return interviews.every(i => i.result !== null);
  }
  
  getReason(): string {
    return 'Must complete all interviews in current stage';
  }
}
```

**3. Orquestador de reglas**
```typescript
class StageTransitionValidator {
  constructor(private rules: IStageTransitionRule[]) {}
  
  async validate(from: InterviewStep, to: InterviewStep): Promise<ValidationResult> {
    for (const rule of this.rules) {
      if (!await rule.canTransition(from, to)) {
        return { valid: false, reason: rule.getReason() };
      }
    }
    return { valid: true };
  }
}

// Uso
const validator = new StageTransitionValidator([
  new SequentialTransitionRule(),
  new NoSkipStagesRule()
]);
```

**Explicación:**
- El sistema está **abierto a extensión** (nuevas reglas) pero **cerrado a modificación** (no tocamos código existente)
- Agregar nuevas reglas solo requiere crear nuevas clases que implementen `IStageTransitionRule`

---

### 4.3 Liskov Substitution Principle (LSP)

#### **Antes (Violación de LSP)**
```typescript
class Position {
  async getCandidates(): Promise<Candidate[]> {
    const applications = await prisma.application.findMany({
      where: { positionId: this.id },
      include: { candidate: true }
    });
    return applications.map(a => a.candidate);
  }
}

class RemotePosition extends Position {
  async getCandidates(): Promise<Candidate[]> {
    // Rompe el contrato: devuelve solo candidatos con ubicación remota
    const applications = await prisma.application.findMany({
      where: { 
        positionId: this.id,
        candidate: { address: { contains: 'Remote' } }
      },
      include: { candidate: true }
    });
    return applications.map(a => a.candidate);
  }
}

// Problema:
function processPosition(position: Position) {
  const candidates = position.getCandidates(); // Comportamiento inesperado con RemotePosition
}
```

**Problema:** La subclase cambia el comportamiento esperado de la clase base.

#### **Después (Aplicando LSP)**

**Opción 1: Usar composición en lugar de herencia**
```typescript
interface ICandidateFilter {
  matches(candidate: Candidate): boolean;
}

class AllCandidatesFilter implements ICandidateFilter {
  matches(candidate: Candidate): boolean {
    return true;
  }
}

class RemoteCandidatesFilter implements ICandidateFilter {
  matches(candidate: Candidate): boolean {
    return candidate.address?.includes('Remote') || false;
  }
}

class Position {
  constructor(private candidateFilter: ICandidateFilter = new AllCandidatesFilter()) {}
  
  async getCandidates(): Promise<Candidate[]> {
    const applications = await prisma.application.findMany({
      where: { positionId: this.id },
      include: { candidate: true }
    });
    
    return applications
      .map(a => a.candidate)
      .filter(c => this.candidateFilter.matches(c));
  }
}

// Uso
const remotePosition = new Position(new RemoteCandidatesFilter());
const allCandidates = new Position(); // Usa filtro por defecto
```

**Explicación:**
- Eliminamos la herencia problemática
- Usamos composición con interfaces
- Todas las instancias de `Position` tienen el mismo contrato
- El filtrado es una responsabilidad separada e intercambiable

---

### 4.4 Interface Segregation Principle (ISP)

#### **Antes (Violación de ISP)**
```typescript
interface IKanbanRepository {
  // Candidatos
  getCandidatesByPosition(positionId: number): Promise<Candidate[]>;
  updateCandidateStage(candidateId: number, stage: number): Promise<void>;
  
  // Posiciones
  getAllPositions(): Promise<Position[]>;
  createPosition(data: any): Promise<Position>;
  
  // Entrevistas
  getInterviewsByCandidate(candidateId: number): Promise<Interview[]>;
  scheduleInterview(data: any): Promise<Interview>;
  
  // Reportes
  getKanbanStatistics(): Promise<any>;
  exportKanbanData(): Promise<Buffer>;
}

// Problema: Un servicio que solo necesita obtener candidatos
// se ve obligado a depender de métodos que no usa
class KanbanViewService {
  constructor(private repository: IKanbanRepository) {}
  
  async getView(positionId: number) {
    // Solo necesita getCandidatesByPosition, pero depende de toda la interfaz
    return this.repository.getCandidatesByPosition(positionId);
  }
}
```

**Problema:** Los clientes se ven forzados a depender de métodos que no utilizan.

#### **Después (Aplicando ISP)**

**Segregar en interfaces específicas**
```typescript
interface IApplicationReader {
  findByPositionId(positionId: number): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
}

interface IApplicationWriter {
  updateInterviewStep(applicationId: number, stepId: number): Promise<Application>;
  create(data: ApplicationData): Promise<Application>;
}

interface IInterviewReader {
  findByApplicationId(applicationId: number): Promise<Interview[]>;
  calculateAverageScore(applicationId: number): Promise<number | null>;
}

interface IInterviewWriter {
  create(data: InterviewData): Promise<Interview>;
  updateScore(interviewId: number, score: number): Promise<Interview>;
}

// Ahora los servicios solo dependen de lo que necesitan
class KanbanViewService {
  constructor(
    private applicationReader: IApplicationReader,
    private interviewReader: IInterviewReader
  ) {}
  
  async getCandidatesByPosition(positionId: number) {
    const applications = await this.applicationReader.findByPositionId(positionId);
    // ... lógica
  }
}

class StageUpdateService {
  constructor(
    private applicationReader: IApplicationReader,
    private applicationWriter: IApplicationWriter
  ) {}
  
  async updateStage(applicationId: number, newStepId: number) {
    const application = await this.applicationReader.findById(applicationId);
    // ... validaciones
    return this.applicationWriter.updateInterviewStep(applicationId, newStepId);
  }
}
```

**Explicación:**
- Interfaces pequeñas y cohesivas
- Cada servicio depende solo de las operaciones que necesita
- Facilita testing (menos métodos que mockear)
- Reduce acoplamiento

---

### 4.5 Dependency Inversion Principle (DIP)

#### **Antes (Violación de DIP)**
```typescript
// Servicio depende directamente de implementación concreta (Prisma)
import { PrismaClient } from '@prisma/client';

export class KanbanService {
  private prisma = new PrismaClient();
  
  async getCandidatesByPosition(positionId: number) {
    // Acoplado directamente a Prisma
    const applications = await this.prisma.application.findMany({
      where: { positionId },
      include: { candidate: true, interviews: true }
    });
    
    return applications.map(app => ({
      candidateId: app.candidate.id,
      fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      averageScore: this.calculateAverage(app.interviews)
    }));
  }
}
```

**Problemas:**
- Alto acoplamiento con Prisma
- Imposible testear sin base de datos real
- No se puede cambiar de ORM sin reescribir el servicio

#### **Después (Aplicando DIP)**

**1. Definir abstracciones (interfaces)**
```typescript
// Capa de dominio - Abstracciones
interface IApplicationRepository {
  findByPositionId(positionId: number): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
  updateInterviewStep(applicationId: number, stepId: number): Promise<void>;
}

interface IInterviewRepository {
  findByApplicationId(applicationId: number): Promise<Interview[]>;
  calculateAverageScore(applicationId: number): Promise<number | null>;
}
```

**2. Implementación concreta (infraestructura)**
```typescript
// Capa de infraestructura - Implementación con Prisma
import { PrismaClient } from '@prisma/client';

export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findByPositionId(positionId: number): Promise<Application[]> {
    const data = await this.prisma.application.findMany({
      where: { positionId },
      include: { candidate: true, interviewStep: true }
    });
    return data.map(d => new Application(d));
  }
  
  async findById(id: number): Promise<Application | null> {
    const data = await this.prisma.application.findUnique({ where: { id } });
    return data ? new Application(data) : null;
  }
  
  async updateInterviewStep(applicationId: number, stepId: number): Promise<void> {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentInterviewStep: stepId }
    });
  }
}

export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findByApplicationId(applicationId: number): Promise<Interview[]> {
    const data = await this.prisma.interview.findMany({
      where: { applicationId }
    });
    return data.map(d => new Interview(d));
  }
  
  async calculateAverageScore(applicationId: number): Promise<number | null> {
    const result = await this.prisma.interview.aggregate({
      where: { applicationId, score: { not: null } },
      _avg: { score: true }
    });
    return result._avg.score;
  }
}
```

**3. Servicio depende de abstracciones**
```typescript
// Capa de aplicación - Depende de interfaces, no implementaciones
export class KanbanService {
  constructor(
    private applicationRepository: IApplicationRepository,
    private interviewRepository: IInterviewRepository
  ) {}
  
  async getCandidatesByPosition(positionId: number): Promise<CandidateKanbanCard[]> {
    const applications = await this.applicationRepository.findByPositionId(positionId);
    
    return Promise.all(
      applications.map(async (app) => {
        const averageScore = await this.interviewRepository.calculateAverageScore(app.id!);
        return {
          candidateId: app.candidateId,
          fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          currentInterviewStep: app.interviewStep.name,
          averageScore,
          applicationId: app.id!
        };
      })
    );
  }
}
```

**4. Inyección de dependencias**
```typescript
// index.ts - Configuración de dependencias
const prisma = new PrismaClient();
const applicationRepository = new PrismaApplicationRepository(prisma);
const interviewRepository = new PrismaInterviewRepository(prisma);
const kanbanService = new KanbanService(applicationRepository, interviewRepository);

// Controller recibe el servicio
const kanbanController = new KanbanController(kanbanService);
```

**5. Testing fácil con mocks**
```typescript
// kanbanService.test.ts
describe('KanbanService', () => {
  it('should get candidates by position', async () => {
    // Mocks de las interfaces
    const mockApplicationRepo: IApplicationRepository = {
      findByPositionId: jest.fn().mockResolvedValue([
        { id: 1, candidateId: 1, positionId: 1, currentInterviewStep: 2 }
      ]),
      findById: jest.fn(),
      updateInterviewStep: jest.fn()
    };
    
    const mockInterviewRepo: IInterviewRepository = {
      findByApplicationId: jest.fn(),
      calculateAverageScore: jest.fn().mockResolvedValue(8.5)
    };
    
    const service = new KanbanService(mockApplicationRepo, mockInterviewRepo);
    const result = await service.getCandidatesByPosition(1);
    
    expect(result).toHaveLength(1);
    expect(result[0].averageScore).toBe(8.5);
  });
});
```

**Explicación:**
- **Módulos de alto nivel** (KanbanService) no dependen de módulos de bajo nivel (Prisma)
- **Ambos dependen de abstracciones** (interfaces)
- Las abstracciones están en la capa de dominio/aplicación
- Las implementaciones concretas están en la capa de infraestructura
- Facilita testing, cambio de ORM y mantenimiento

---

### 4.6 Don't Repeat Yourself (DRY)

#### **Antes (Violación de DRY)**
```typescript
// Duplicación en controladores
export const getPositionCandidates = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'Invalid position ID' });
    }
    // ... lógica
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error' });
    }
  }
};

export const updateCandidateStage = async (req: Request, res: Response) => {
  try {
    const candidateId = parseInt(req.params.id);
    if (isNaN(candidateId)) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }
    // ... lógica
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error' });
    }
  }
};

// Duplicación en cálculo de promedios
const avgScore1 = interviews.reduce((sum, i) => sum + (i.score || 0), 0) / interviews.length;
// ... en otro lugar
const avgScore2 = interviews.reduce((sum, i) => sum + (i.score || 0), 0) / interviews.length;
```

#### **Después (Aplicando DRY)**

**1. Extraer validación común**
```typescript
// utils/validators.ts
export function validateIdParam(paramValue: string, paramName: string): number {
  const id = parseInt(paramValue);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${paramName}: must be a positive integer`);
  }
  return id;
}
```

**2. Extraer manejo de errores común**
```typescript
// middlewares/errorHandler.ts
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
```

**3. Extraer lógica de cálculo común**
```typescript
// domain/services/scoreCalculator.ts
export class ScoreCalculator {
  static calculateAverage(interviews: Interview[]): number | null {
    const validScores = interviews
      .map(i => i.score)
      .filter((score): score is number => score !== null && score !== undefined);
    
    if (validScores.length === 0) return null;
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / validScores.length) * 100) / 100; // Redondear a 2 decimales
  }
  
  static calculateWeightedAverage(
    interviews: Interview[], 
    weights: Map<number, number>
  ): number | null {
    // Lógica reutilizable para promedios ponderados
    // ...
  }
}
```

**4. Controladores refactorizados**
```typescript
export const getPositionCandidates = asyncHandler(async (req: Request, res: Response) => {
  const positionId = validateIdParam(req.params.id, 'position ID');
  const candidates = await kanbanService.getCandidatesByPosition(positionId);
  res.json(candidates);
});

export const updateCandidateStage = asyncHandler(async (req: Request, res: Response) => {
  const candidateId = validateIdParam(req.params.id, 'candidate ID');
  const { applicationId, newInterviewStepId } = req.body;
  
  await kanbanService.updateCandidateStage(applicationId, newInterviewStepId);
  res.status(200).json({ message: 'Stage updated successfully' });
});
```

**Explicación:**
- **Validación centralizada**: Una única función para validar IDs
- **Manejo de errores centralizado**: Middleware reutilizable
- **Lógica de negocio reutilizable**: ScoreCalculator puede usarse en múltiples contextos
- **Código más limpio**: Controladores más simples y legibles

---

## 5. Estructura de Archivos Propuesta

```
backend/src/
├── domain/
│   ├── models/                        # Entidades existentes
│   │   ├── Application.ts
│   │   ├── Interview.ts
│   │   └── ...
│   ├── valueObjects/                  # NUEVO: Value Objects
│   │   ├── CandidateKanbanCard.ts
│   │   └── StageTransition.ts
│   ├── services/                      # NUEVO: Domain Services
│   │   ├── KanbanDomainService.ts
│   │   ├── ScoreCalculator.ts
│   │   └── StageTransitionValidator.ts
│   └── repositories/                  # NUEVO: Interfaces de repositorio
│       ├── IApplicationRepository.ts
│       ├── IInterviewRepository.ts
│       └── IInterviewStepRepository.ts
│
├── infrastructure/                    # NUEVO: Capa de infraestructura
│   └── repositories/
│       ├── PrismaApplicationRepository.ts
│       ├── PrismaInterviewRepository.ts
│       └── PrismaInterviewStepRepository.ts
│
├── application/
│   ├── services/
│   │   ├── candidateService.ts        # Existente
│   │   └── kanbanService.ts           # NUEVO: Servicio de aplicación Kanban
│   ├── dtos/                          # NUEVO: Data Transfer Objects
│   │   ├── GetPositionCandidatesDto.ts
│   │   └── UpdateStageDto.ts
│   └── validator.ts                   # Existente
│
├── presentation/
│   ├── controllers/
│   │   ├── candidateController.ts     # Existente
│   │   └── kanbanController.ts        # NUEVO: Controlador Kanban
│   └── middlewares/                   # NUEVO: Middlewares
│       ├── errorHandler.ts
│       └── asyncHandler.ts
│
├── routes/
│   ├── candidateRoutes.ts             # Existente
│   ├── positionRoutes.ts              # NUEVO: Rutas de posiciones
│   └── index.ts                       # NUEVO: Centralizador de rutas
│
└── utils/                             # NUEVO: Utilidades
    ├── validators.ts
    └── errors.ts
```

---

## 6. Plan de Implementación Paso a Paso

### Fase 1: Preparación de Infraestructura (Estimado: 2-3 horas)

#### 6.1 Crear clases de error personalizadas
**Archivo:** `src/utils/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}
```

#### 6.2 Crear validadores reutilizables
**Archivo:** `src/utils/validators.ts`

```typescript
export function validateIdParam(paramValue: string, paramName: string): number {
  const id = parseInt(paramValue);
  if (isNaN(id) || id <= 0) {
    throw new ValidationError(`Invalid ${paramName}: must be a positive integer`);
  }
  return id;
}

export function validateRequiredFields(obj: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }
}
```

#### 6.3 Crear middlewares
**Archivo:** `src/presentation/middlewares/asyncHandler.ts`

```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

**Archivo:** `src/presentation/middlewares/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}
```

---

### Fase 2: Capa de Dominio (Estimado: 3-4 horas)

#### 6.4 Definir interfaces de repositorio
**Archivo:** `src/domain/repositories/IApplicationRepository.ts`

```typescript
import { Application } from '../models/Application';

export interface IApplicationRepository {
  findByPositionId(positionId: number): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
  updateInterviewStep(applicationId: number, stepId: number): Promise<void>;
}
```

**Archivo:** `src/domain/repositories/IInterviewRepository.ts`

```typescript
import { Interview } from '../models/Interview';

export interface IInterviewRepository {
  findByApplicationId(applicationId: number): Promise<Interview[]>;
  calculateAverageScore(applicationId: number): Promise<number | null>;
}
```

**Archivo:** `src/domain/repositories/IInterviewStepRepository.ts`

```typescript
import { InterviewStep } from '../models/InterviewStep';

export interface IInterviewStepRepository {
  findById(id: number): Promise<InterviewStep | null>;
  findByFlowId(flowId: number): Promise<InterviewStep[]>;
}
```

**Archivo:** `src/domain/repositories/ICandidateRepository.ts`

```typescript
import { Candidate } from '../models/Candidate';

export interface ICandidateRepository {
  findById(id: number): Promise<Candidate | null>;
}
```

#### 6.5 Crear Value Objects
**Archivo:** `src/domain/valueObjects/CandidateKanbanCard.ts`

```typescript
export interface CandidateKanbanCard {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number | null;
  applicationId: number;
}

export function createCandidateKanbanCard(
  candidateId: number,
  fullName: string,
  currentInterviewStep: string,
  averageScore: number | null,
  applicationId: number
): CandidateKanbanCard {
  return {
    candidateId,
    fullName,
    currentInterviewStep,
    averageScore,
    applicationId
  };
}
```

**Archivo:** `src/domain/valueObjects/StageTransition.ts`

```typescript
export interface StageTransition {
  applicationId: number;
  fromStepId: number;
  toStepId: number;
  transitionDate: Date;
}

export function createStageTransition(
  applicationId: number,
  fromStepId: number,
  toStepId: number
): StageTransition {
  return {
    applicationId,
    fromStepId,
    toStepId,
    transitionDate: new Date()
  };
}
```

#### 6.6 Crear servicios de dominio
**Archivo:** `src/domain/services/ScoreCalculator.ts`

```typescript
import { Interview } from '../models/Interview';

export class ScoreCalculator {
  static calculateAverage(interviews: Interview[]): number | null {
    const validScores = interviews
      .map(i => i.score)
      .filter((score): score is number => score !== null && score !== undefined);
    
    if (validScores.length === 0) return null;
    
    const sum = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / validScores.length) * 100) / 100;
  }
}
```

**Archivo:** `src/domain/services/StageTransitionValidator.ts`

```typescript
import { InterviewStep } from '../models/InterviewStep';
import { BusinessRuleError } from '../../utils/errors';

export class StageTransitionValidator {
  static validateTransition(
    currentStep: InterviewStep,
    newStep: InterviewStep,
    interviewFlowId: number
  ): void {
    // Validar que ambos pasos pertenecen al mismo flujo
    if (currentStep.interviewFlowId !== interviewFlowId || 
        newStep.interviewFlowId !== interviewFlowId) {
      throw new BusinessRuleError(
        'The new stage does not belong to the same interview flow'
      );
    }

    // Validar que no se salten pasos (opcional, según reglas de negocio)
    const orderDifference = Math.abs(newStep.orderIndex - currentStep.orderIndex);
    if (orderDifference > 1) {
      throw new BusinessRuleError(
        'Cannot skip stages in the interview process'
      );
    }

    // Validar que no se retroceda más de un paso (opcional)
    if (newStep.orderIndex < currentStep.orderIndex - 1) {
      throw new BusinessRuleError(
        'Can only move back one stage at a time'
      );
    }
  }
}
```

**Archivo:** `src/domain/services/KanbanDomainService.ts`

```typescript
import { IApplicationRepository } from '../repositories/IApplicationRepository';
import { IInterviewRepository } from '../repositories/IInterviewRepository';
import { IInterviewStepRepository } from '../repositories/IInterviewStepRepository';
import { ICandidateRepository } from '../repositories/ICandidateRepository';
import { CandidateKanbanCard, createCandidateKanbanCard } from '../valueObjects/CandidateKanbanCard';
import { Application } from '../models/Application';

export class KanbanDomainService {
  constructor(
    private candidateRepository: ICandidateRepository,
    private interviewStepRepository: IInterviewStepRepository,
    private interviewRepository: IInterviewRepository
  ) {}

  async buildKanbanCard(application: Application): Promise<CandidateKanbanCard> {
    const [candidate, interviewStep, averageScore] = await Promise.all([
      this.candidateRepository.findById(application.candidateId),
      this.interviewStepRepository.findById(application.currentInterviewStep),
      this.interviewRepository.calculateAverageScore(application.id!)
    ]);

    if (!candidate) {
      throw new Error(`Candidate with ID ${application.candidateId} not found`);
    }

    if (!interviewStep) {
      throw new Error(`Interview step with ID ${application.currentInterviewStep} not found`);
    }

    return createCandidateKanbanCard(
      candidate.id!,
      `${candidate.firstName} ${candidate.lastName}`,
      interviewStep.name,
      averageScore,
      application.id!
    );
  }
}
```

---

### Fase 3: Capa de Infraestructura (Estimado: 2-3 horas)

#### 6.7 Implementar repositorios con Prisma
**Archivo:** `src/infrastructure/repositories/PrismaApplicationRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { Application } from '../../domain/models/Application';

export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByPositionId(positionId: number): Promise<Application[]> {
    const applications = await this.prisma.application.findMany({
      where: { positionId },
      include: {
        candidate: true,
        interviewStep: true,
        interviews: true
      }
    });

    return applications.map(app => new Application(app));
  }

  async findById(id: number): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        interviewStep: true,
        position: {
          include: { interviewFlow: true }
        }
      }
    });

    return application ? new Application(application) : null;
  }

  async updateInterviewStep(applicationId: number, stepId: number): Promise<void> {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { currentInterviewStep: stepId }
    });
  }
}
```

**Archivo:** `src/infrastructure/repositories/PrismaInterviewRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IInterviewRepository } from '../../domain/repositories/IInterviewRepository';
import { Interview } from '../../domain/models/Interview';

export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(private prisma: PrismaClient) {}

  async findByApplicationId(applicationId: number): Promise<Interview[]> {
    const interviews = await this.prisma.interview.findMany({
      where: { applicationId }
    });

    return interviews.map(interview => new Interview(interview));
  }

  async calculateAverageScore(applicationId: number): Promise<number | null> {
    const result = await this.prisma.interview.aggregate({
      where: {
        applicationId,
        score: { not: null }
      },
      _avg: {
        score: true
      }
    });

    return result._avg.score ? Math.round(result._avg.score * 100) / 100 : null;
  }
}
```

**Archivo:** `src/infrastructure/repositories/PrismaInterviewStepRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';
import { InterviewStep } from '../../domain/models/InterviewStep';

export class PrismaInterviewStepRepository implements IInterviewStepRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<InterviewStep | null> {
    const step = await this.prisma.interviewStep.findUnique({
      where: { id }
    });

    return step ? new InterviewStep(step) : null;
  }

  async findByFlowId(flowId: number): Promise<InterviewStep[]> {
    const steps = await this.prisma.interviewStep.findMany({
      where: { interviewFlowId: flowId },
      orderBy: { orderIndex: 'asc' }
    });

    return steps.map(step => new InterviewStep(step));
  }
}
```

**Archivo:** `src/infrastructure/repositories/PrismaCandidateRepository.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { Candidate } from '../../domain/models/Candidate';

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Candidate | null> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id }
    });

    return candidate ? new Candidate(candidate) : null;
  }
}
```

---

### Fase 4: Capa de Aplicación (Estimado: 2-3 horas)

#### 6.8 Crear DTOs
**Archivo:** `src/application/dtos/GetPositionCandidatesDto.ts`

```typescript
export interface GetPositionCandidatesResponseDto {
  candidateId: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number | null;
  applicationId: number;
}
```

**Archivo:** `src/application/dtos/UpdateStageDto.ts`

```typescript
export interface UpdateStageRequestDto {
  applicationId: number;
  newInterviewStepId: number;
}

export interface UpdateStageResponseDto {
  message: string;
  application: {
    id: number;
    currentInterviewStep: number;
    updatedAt: Date;
  };
}
```

#### 6.9 Crear servicio de aplicación Kanban
**Archivo:** `src/application/services/kanbanService.ts`

```typescript
import { IApplicationRepository } from '../../domain/repositories/IApplicationRepository';
import { IInterviewRepository } from '../../domain/repositories/IInterviewRepository';
import { IInterviewStepRepository } from '../../domain/repositories/IInterviewStepRepository';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { KanbanDomainService } from '../../domain/services/KanbanDomainService';
import { StageTransitionValidator } from '../../domain/services/StageTransitionValidator';
import { GetPositionCandidatesResponseDto } from '../dtos/GetPositionCandidatesDto';
import { UpdateStageRequestDto, UpdateStageResponseDto } from '../dtos/UpdateStageDto';
import { NotFoundError, ValidationError } from '../../utils/errors';

export class KanbanService {
  private kanbanDomainService: KanbanDomainService;

  constructor(
    private applicationRepository: IApplicationRepository,
    private interviewRepository: IInterviewRepository,
    private interviewStepRepository: IInterviewStepRepository,
    private candidateRepository: ICandidateRepository
  ) {
    this.kanbanDomainService = new KanbanDomainService(
      candidateRepository,
      interviewStepRepository,
      interviewRepository
    );
  }

  async getCandidatesByPosition(positionId: number): Promise<GetPositionCandidatesResponseDto[]> {
    if (!positionId || positionId <= 0) {
      throw new ValidationError('Invalid position ID');
    }

    const applications = await this.applicationRepository.findByPositionId(positionId);

    if (applications.length === 0) {
      return [];
    }

    const kanbanCards = await Promise.all(
      applications.map(app => this.kanbanDomainService.buildKanbanCard(app))
    );

    return kanbanCards;
  }

  async updateCandidateStage(
    candidateId: number,
    updateData: UpdateStageRequestDto
  ): Promise<UpdateStageResponseDto> {
    const { applicationId, newInterviewStepId } = updateData;

    // Validar entrada
    if (!applicationId || !newInterviewStepId) {
      throw new ValidationError('applicationId and newInterviewStepId are required');
    }

    // Obtener la aplicación
    const application = await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application');
    }

    // Verificar que la aplicación pertenece al candidato
    if (application.candidateId !== candidateId) {
      throw new ValidationError('Application does not belong to the specified candidate');
    }

    // Obtener los pasos de entrevista
    const [currentStep, newStep] = await Promise.all([
      this.interviewStepRepository.findById(application.currentInterviewStep),
      this.interviewStepRepository.findById(newInterviewStepId)
    ]);

    if (!currentStep) {
      throw new NotFoundError('Current interview step');
    }

    if (!newStep) {
      throw new NotFoundError('New interview step');
    }

    // Validar la transición usando el servicio de dominio
    const interviewFlowId = (application as any).position?.interviewFlowId || currentStep.interviewFlowId;
    StageTransitionValidator.validateTransition(currentStep, newStep, interviewFlowId);

    // Actualizar el paso de entrevista
    await this.applicationRepository.updateInterviewStep(applicationId, newInterviewStepId);

    return {
      message: 'Stage updated successfully',
      application: {
        id: applicationId,
        currentInterviewStep: newInterviewStepId,
        updatedAt: new Date()
      }
    };
  }
}
```

---

### Fase 5: Capa de Presentación (Estimado: 2 horas)

#### 6.10 Crear controlador Kanban
**Archivo:** `src/presentation/controllers/kanbanController.ts`

```typescript
import { Request, Response } from 'express';
import { KanbanService } from '../../application/services/kanbanService';
import { validateIdParam } from '../../utils/validators';
import { UpdateStageRequestDto } from '../../application/dtos/UpdateStageDto';

export class KanbanController {
  constructor(private kanbanService: KanbanService) {}

  getCandidatesByPosition = async (req: Request, res: Response): Promise<void> => {
    const positionId = validateIdParam(req.params.id, 'position ID');
    const candidates = await this.kanbanService.getCandidatesByPosition(positionId);
    res.json(candidates);
  };

  updateCandidateStage = async (req: Request, res: Response): Promise<void> => {
    const candidateId = validateIdParam(req.params.id, 'candidate ID');
    const updateData: UpdateStageRequestDto = req.body;

    const result = await this.kanbanService.updateCandidateStage(candidateId, updateData);
    res.json(result);
  };
}
```

---

### Fase 6: Rutas y Configuración (Estimado: 1-2 horas)

#### 6.11 Crear rutas de posiciones
**Archivo:** `src/routes/positionRoutes.ts`

```typescript
import { Router } from 'express';
import { asyncHandler } from '../presentation/middlewares/asyncHandler';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function createPositionRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // GET /positions/:id/candidates
  router.get(
    '/:id/candidates',
    asyncHandler(kanbanController.getCandidatesByPosition)
  );

  return router;
}
```

#### 6.12 Crear rutas de candidatos Kanban
**Archivo:** `src/routes/candidateKanbanRoutes.ts`

```typescript
import { Router } from 'express';
import { asyncHandler } from '../presentation/middlewares/asyncHandler';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function createCandidateKanbanRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // PUT /candidates/:id/stage
  router.put(
    '/:id/stage',
    asyncHandler(kanbanController.updateCandidateStage)
  );

  return router;
}
```

#### 6.13 Actualizar archivo principal de rutas
**Archivo:** `src/routes/index.ts` (NUEVO)

```typescript
import { Router } from 'express';
import candidateRoutes from './candidateRoutes';
import { createPositionRoutes } from './positionRoutes';
import { createCandidateKanbanRoutes } from './candidateKanbanRoutes';
import { KanbanController } from '../presentation/controllers/kanbanController';

export function setupRoutes(kanbanController: KanbanController): Router {
  const router = Router();

  // Rutas existentes
  router.use('/candidates', candidateRoutes);

  // Nuevas rutas Kanban
  router.use('/positions', createPositionRoutes(kanbanController));
  
  // Ruta para actualizar stage (puede ir en /candidates o separada)
  const candidateKanbanRoutes = createCandidateKanbanRoutes(kanbanController);
  router.use('/candidates', candidateKanbanRoutes);

  return router;
}
```

#### 6.14 Actualizar index.ts principal
**Archivo:** `src/index.ts`

**Antes:**
```typescript
import express from 'express';
import candidateRoutes from './routes/candidateRoutes';
// ...

app.use('/candidates', candidateRoutes);
```

**Después:**
```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { setupRoutes } from './routes';
import { errorHandler } from './presentation/middlewares/errorHandler';

// Inicializar Prisma
import { PrismaApplicationRepository } from './infrastructure/repositories/PrismaApplicationRepository';
import { PrismaInterviewRepository } from './infrastructure/repositories/PrismaInterviewRepository';
import { PrismaInterviewStepRepository } from './infrastructure/repositories/PrismaInterviewStepRepository';
import { PrismaCandidateRepository } from './infrastructure/repositories/PrismaCandidateRepository';
import { KanbanService } from './application/services/kanbanService';
import { KanbanController } from './presentation/controllers/kanbanController';

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(express.json());
app.use(cors());

// Inyección de dependencias
const applicationRepository = new PrismaApplicationRepository(prisma);
const interviewRepository = new PrismaInterviewRepository(prisma);
const interviewStepRepository = new PrismaInterviewStepRepository(prisma);
const candidateRepository = new PrismaCandidateRepository(prisma);

const kanbanService = new KanbanService(
  applicationRepository,
  interviewRepository,
  interviewStepRepository,
  candidateRepository
);

const kanbanController = new KanbanController(kanbanService);

// Rutas
const routes = setupRoutes(kanbanController);
app.use('/api', routes);

// Error handler (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 7. Testing

### 7.1 Estrategia de Testing

#### Tests Unitarios (Unit Tests)

**Archivo:** `src/__tests__/unit/ScoreCalculator.test.ts`

```typescript
import { ScoreCalculator } from '../../../domain/services/ScoreCalculator';
import { Interview } from '../../../domain/models/Interview';

describe('ScoreCalculator', () => {
  describe('calculateAverage', () => {
    it('should calculate average score correctly', () => {
      const interviews = [
        new Interview({ score: 8 }),
        new Interview({ score: 9 }),
        new Interview({ score: 7 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(8);
    });

    it('should return null if no interviews have scores', () => {
      const interviews = [
        new Interview({ score: null }),
        new Interview({ score: undefined })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBeNull();
    });

    it('should ignore null scores in calculation', () => {
      const interviews = [
        new Interview({ score: 10 }),
        new Interview({ score: null }),
        new Interview({ score: 8 })
      ];

      const average = ScoreCalculator.calculateAverage(interviews);
      expect(average).toBe(9);
    });
  });
});
```

**Archivo:** `src/__tests__/unit/StageTransitionValidator.test.ts`

```typescript
import { StageTransitionValidator } from '../../../domain/services/StageTransitionValidator';
import { InterviewStep } from '../../../domain/models/InterviewStep';
import { BusinessRuleError } from '../../../utils/errors';

describe('StageTransitionValidator', () => {
  it('should allow transition to next stage', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 2,
      interviewFlowId: 1,
      orderIndex: 2,
      name: 'Technical Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).not.toThrow();
  });

  it('should throw error when skipping stages', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 3,
      interviewFlowId: 1,
      orderIndex: 3,
      name: 'Final Interview'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow(BusinessRuleError);
  });

  it('should throw error when new step is from different flow', () => {
    const currentStep = new InterviewStep({
      id: 1,
      interviewFlowId: 1,
      orderIndex: 1,
      name: 'HR Interview'
    });

    const newStep = new InterviewStep({
      id: 5,
      interviewFlowId: 2,
      orderIndex: 1,
      name: 'Other Flow Step'
    });

    expect(() => {
      StageTransitionValidator.validateTransition(currentStep, newStep, 1);
    }).toThrow(BusinessRuleError);
  });
});
```

#### Tests de Integración

**Archivo:** `src/__tests__/integration/kanbanService.test.ts`

```typescript
import { KanbanService } from '../../../application/services/kanbanService';
import { IApplicationRepository } from '../../../domain/repositories/IApplicationRepository';
import { IInterviewRepository } from '../../../domain/repositories/IInterviewRepository';
import { Application } from '../../../domain/models/Application';
import { Interview } from '../../../domain/models/Interview';

describe('KanbanService Integration Tests', () => {
  let kanbanService: KanbanService;
  let mockApplicationRepo: jest.Mocked<IApplicationRepository>;
  let mockInterviewRepo: jest.Mocked<IInterviewRepository>;

  beforeEach(() => {
    mockApplicationRepo = {
      findByPositionId: jest.fn(),
      findById: jest.fn(),
      updateInterviewStep: jest.fn()
    } as any;

    mockInterviewRepo = {
      findByApplicationId: jest.fn(),
      calculateAverageScore: jest.fn()
    } as any;

    kanbanService = new KanbanService(
      mockApplicationRepo,
      mockInterviewRepo,
      {} as any,
      {} as any
    );
  });

  describe('getCandidatesByPosition', () => {
    it('should return candidates with average scores', async () => {
      const mockApplications = [
        new Application({
          id: 1,
          positionId: 1,
          candidateId: 1,
          currentInterviewStep: 2
        })
      ];

      mockApplicationRepo.findByPositionId.mockResolvedValue(mockApplications);
      mockInterviewRepo.calculateAverageScore.mockResolvedValue(8.5);

      const result = await kanbanService.getCandidatesByPosition(1);

      expect(result).toHaveLength(1);
      expect(mockApplicationRepo.findByPositionId).toHaveBeenCalledWith(1);
      expect(mockInterviewRepo.calculateAverageScore).toHaveBeenCalledWith(1);
    });
  });
});
```

### 7.2 Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con cobertura
npm test -- --coverage

# Ejecutar solo tests unitarios
npm test -- --testPathPattern=unit

# Ejecutar solo tests de integración
npm test -- --testPathPattern=integration
```

---

## 8. Documentación API

### 8.1 Especificación OpenAPI

Agregar al archivo `backend/api-spec.yaml`:

```yaml
paths:
  /positions/{id}/candidates:
    get:
      summary: Obtener candidatos de una posición para Kanban
      description: Retorna todos los candidatos en proceso para una posición específica con su etapa actual y puntuación promedio
      tags:
        - Kanban
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: ID de la posición
      responses:
        '200':
          description: Lista de candidatos
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    candidateId:
                      type: integer
                      example: 1
                    fullName:
                      type: string
                      example: "John Doe"
                    currentInterviewStep:
                      type: string
                      example: "Technical Interview"
                    averageScore:
                      type: number
                      nullable: true
                      example: 7.5
                    applicationId:
                      type: integer
                      example: 5
        '400':
          description: ID de posición inválido
        '404':
          description: Posición no encontrada
        '500':
          description: Error interno del servidor

  /candidates/{id}/stage:
    put:
      summary: Actualizar etapa de entrevista de un candidato
      description: Cambia la etapa actual del proceso de entrevista de un candidato
      tags:
        - Kanban
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: integer
          description: ID del candidato
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - applicationId
                - newInterviewStepId
              properties:
                applicationId:
                  type: integer
                  description: ID de la aplicación a actualizar
                  example: 5
                newInterviewStepId:
                  type: integer
                  description: ID del nuevo paso de entrevista
                  example: 3
      responses:
        '200':
          description: Etapa actualizada exitosamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                    example: "Stage updated successfully"
                  application:
                    type: object
                    properties:
                      id:
                        type: integer
                        example: 5
                      currentInterviewStep:
                        type: integer
                        example: 3
                      updatedAt:
                        type: string
                        format: date-time
        '400':
          description: Datos inválidos o transición no permitida
        '404':
          description: Candidato o aplicación no encontrada
        '422':
          description: Regla de negocio violada (ej: saltar etapas)
        '500':
          description: Error interno del servidor
```

---

## 9. Validaciones y Reglas de Negocio

### 9.1 Validaciones de Entrada

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `positionId` | Debe ser un entero positivo | "Invalid position ID: must be a positive integer" |
| `candidateId` | Debe ser un entero positivo | "Invalid candidate ID: must be a positive integer" |
| `applicationId` | Requerido, entero positivo | "applicationId is required and must be positive" |
| `newInterviewStepId` | Requerido, entero positivo | "newInterviewStepId is required and must be positive" |

### 9.2 Reglas de Negocio

#### GET /positions/:id/candidates

1. **Posición debe existir**
   - Si la posición no existe, retorna array vacío (no error)

2. **Cálculo de promedio**
   - Solo considerar entrevistas con score no nulo
   - Si no hay entrevistas con score, retornar `null`
   - Redondear a 2 decimales

3. **Filtrado**
   - Solo incluir candidatos con aplicaciones activas
   - No incluir candidatos rechazados (si hay campo de estado)

#### PUT /candidates/:id/stage

1. **La aplicación debe pertenecer al candidato**
   - Error 400: "Application does not belong to the specified candidate"

2. **No se pueden saltar etapas**
   - Solo se permite avanzar/retroceder 1 paso según `orderIndex`
   - Error 422: "Cannot skip stages in the interview process"

3. **La nueva etapa debe pertenecer al mismo flujo**
   - Verificar `interviewFlowId`
   - Error 422: "The new stage does not belong to the same interview flow"

4. **(Opcional) Validar entrevistas completadas**
   - No permitir avanzar si hay entrevistas pendientes en la etapa actual
   - Error 422: "Must complete all interviews in current stage"

---

## 10. Cronograma de Implementación

| Fase | Tareas | Tiempo Estimado | Dependencias |
|------|--------|-----------------|--------------|
| **Fase 1** | Infraestructura (errores, validadores, middlewares) | 2-3 horas | - |
| **Fase 2** | Capa de dominio (interfaces, value objects, servicios) | 3-4 horas | Fase 1 |
| **Fase 3** | Capa de infraestructura (repositorios Prisma) | 2-3 horas | Fase 2 |
| **Fase 4** | Capa de aplicación (DTOs, kanbanService) | 2-3 horas | Fase 3 |
| **Fase 5** | Capa de presentación (controladores) | 2 horas | Fase 4 |
| **Fase 6** | Rutas y configuración | 1-2 horas | Fase 5 |
| **Fase 7** | Testing (unitarios + integración) | 3-4 horas | Fase 6 |
| **Fase 8** | Documentación y refinamiento | 2 horas | Fase 7 |

**Tiempo Total Estimado:** 17-23 horas (aproximadamente 3-4 días laborales)

---

## 11. Checklist de Implementación

### Pre-implementación
- [x] Revisar y entender el modelo de datos actual
- [x] Confirmar reglas de negocio con stakeholders
- [x] Preparar ambiente de desarrollo
- [x] Crear rama de Git para la feature

### Implementación
- [x] **Fase 1:** Crear clases de error personalizadas
- [x] **Fase 1:** Crear validadores reutilizables
- [x] **Fase 1:** Crear middlewares (asyncHandler, errorHandler)
- [x] **Fase 2:** Definir interfaces de repositorio
- [x] **Fase 2:** Crear Value Objects
- [x] **Fase 2:** Crear servicios de dominio
- [x] **Fase 3:** Implementar repositorios Prisma
- [x] **Fase 4:** Crear DTOs
- [x] **Fase 4:** Crear KanbanService
- [x] **Fase 5:** Crear KanbanController
- [x] **Fase 6:** Crear rutas
- [x] **Fase 6:** Actualizar index.ts con inyección de dependencias

### Testing y Documentación
- [x] Escribir tests unitarios para ScoreCalculator
- [x] Escribir tests unitarios para StageTransitionValidator
- [x] Escribir tests unitarios para validadores
- [ ] Escribir tests de integración para KanbanService (Fase posterior)
- [ ] Escribir tests E2E para endpoints (Fase posterior)
- [ ] Actualizar api-spec.yaml con nuevos endpoints
- [ ] Documentar ejemplos de uso

### Validación
- [x] Probar GET /positions/:id/candidates con Postman/Thunder Client
- [x] Probar PUT /candidates/:id/stage con casos válidos
- [x] Probar casos de error (IDs inválidos, transiciones no permitidas)
- [x] Verificar que los promedios se calculan correctamente
- [x] Verificar manejo de errores en todos los endpoints

**Estado:** ✅ **VALIDACIÓN COMPLETADA** - 15/15 tests pasados (100% success rate)  
**Reporte detallado:** Ver `docs/VALIDATION-REPORT.md`

### Despliegue
- [ ] Code review
- [ ] Merge a rama principal
- [ ] Desplegar en ambiente de staging
- [ ] Validación en staging
- [ ] Desplegar en producción

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Performance en listados grandes** | Media | Alto | Implementar paginación en GET /positions/:id/candidates |
| **Concurrencia en actualización de etapas** | Media | Alto | Implementar transacciones y lock optimista |
| **Cálculo de promedio costoso** | Baja | Medio | Cachear scores calculados o usar campo calculado en BD |
| **Reglas de negocio ambiguas** | Alta | Alto | Documentar claramente y validar con stakeholders |
| **Testing insuficiente** | Media | Alto | Definir cobertura mínima del 80% |

---

## 13. Mejoras Futuras

### Corto Plazo
- [ ] Agregar paginación a GET /positions/:id/candidates
- [ ] Implementar filtros (por nombre, por score)
- [ ] Agregar ordenamiento (por nombre, por score, por fecha)
- [ ] Implementar websockets para actualizaciones en tiempo real del Kanban

### Medio Plazo
- [ ] Agregar audit log para cambios de etapa
- [ ] Implementar notificaciones cuando un candidato cambia de etapa
- [ ] Agregar métricas (tiempo promedio por etapa)
- [ ] Implementar caché con Redis para listados

### Largo Plazo
- [ ] Migrar a CQRS (separar lecturas y escrituras)
- [ ] Implementar event sourcing para historial completo
- [ ] Agregar machine learning para predecir éxito del candidato
- [ ] Dashboard analítico del proceso de entrevistas

---

## 14. Conclusión

Este plan de implementación proporciona una guía detallada para construir los dos endpoints Kanban siguiendo:

1. **Domain-Driven Design (DDD):**
   - Agregados bien definidos (Application como raíz)
   - Value Objects (CandidateKanbanCard, StageTransition)
   - Servicios de dominio para lógica compleja
   - Repositorios para abstraer acceso a datos

2. **Principios SOLID:**
   - **SRP:** Cada clase tiene una única responsabilidad
   - **OCP:** Sistema extensible sin modificar código existente
   - **LSP:** Subtipos intercambiables con tipos base
   - **ISP:** Interfaces pequeñas y específicas
   - **DIP:** Dependencia de abstracciones, no implementaciones

3. **DRY:**
   - Validadores reutilizables
   - Manejo de errores centralizado
   - Cálculos compartidos (ScoreCalculator)
   - Middlewares comunes

La implementación está diseñada para ser:
- **Mantenible:** Código limpio y bien estructurado
- **Testeable:** Dependencias inyectadas y abstracciones
- **Escalable:** Preparado para crecer en funcionalidad
- **Profesional:** Siguiendo mejores prácticas de la industria

---

**Fecha de Creación:** Noviembre 2025  
**Versión del Documento:** 1.1  
**Última Actualización:** Noviembre 2025  
**Autor:** Arquitecto de Software ATS  
**Estado:** ✅ **COMPLETADO Y VALIDADO** - Fase 1 Terminada

## Estado de Implementación

### ✅ Completado
- **Fase 1-6:** Todas las capas implementadas (Infraestructura, Dominio, Aplicación, Presentación, Rutas)
- **Tests Unitarios:** ScoreCalculator, StageTransitionValidator, Validators (21 tests)
- **Tests de Validación:** 15 tests automatizados de endpoints (100% success)
- **Arquitectura:** DDD con SOLID principles y Dependency Injection
- **Endpoints:**
  - `GET /api/positions/:id/candidates` - Obtener candidatos para vista Kanban ✅ Validado
  - `PUT /api/candidates/:id/stage` - Actualizar etapa de candidato ✅ Validado
- **Bug Fixes:**
  - Corregido orderIndex en seed data (InterviewStep 3)
  - Validación completa de todas las reglas de negocio

### 📋 Pendiente para Siguientes Fases
- Tests de Integración (con base de datos real)
- Tests E2E (end-to-end)
- Actualización de OpenAPI spec (swagger)
- Autenticación y Autorización

