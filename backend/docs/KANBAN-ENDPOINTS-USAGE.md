# Kanban Endpoints - Guía de Uso

## Descripción General

Los endpoints Kanban permiten visualizar y gestionar el estado de los candidatos en el proceso de entrevistas mediante una interfaz tipo Kanban board.

## Endpoints Disponibles

### 1. Obtener Candidatos para Kanban Board

**Endpoint:** `GET /api/positions/:id/candidates`

**Descripción:** Retorna todos los candidatos que están aplicando a una posición específica, con su información relevante para el Kanban board.

#### Request

```bash
GET http://localhost:3010/api/positions/1/candidates
```

#### Response Exitoso (200)

```json
[
  {
    "candidateId": 1,
    "fullName": "John Doe",
    "currentInterviewStep": "Technical Interview",
    "averageScore": 7.5,
    "applicationId": 5
  },
  {
    "candidateId": 2,
    "fullName": "Jane Smith",
    "currentInterviewStep": "HR Interview",
    "averageScore": 8.2,
    "applicationId": 6
  }
]
```

#### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `candidateId` | number | ID único del candidato |
| `fullName` | string | Nombre completo del candidato |
| `currentInterviewStep` | string | Nombre de la etapa actual en el proceso |
| `averageScore` | number \| null | Promedio de todas las puntuaciones de entrevistas. `null` si no hay puntuaciones |
| `applicationId` | number | ID de la aplicación (necesario para actualizar etapa) |

#### Casos Especiales

- Si no hay candidatos para la posición, retorna array vacío `[]`
- El `averageScore` solo considera entrevistas con puntuación (ignora `null`)
- El score se redondea a 2 decimales

#### Ejemplos con cURL

```bash
# Obtener candidatos de la posición 1
curl http://localhost:3010/api/positions/1/candidates
```

#### Ejemplo con JavaScript (Fetch API)

```javascript
const positionId = 1;

fetch(`http://localhost:3010/api/positions/${positionId}/candidates`)
  .then(response => response.json())
  .then(candidates => {
    console.log('Candidatos:', candidates);
    // Agrupar por etapa para Kanban board
    const kanbanColumns = {};
    candidates.forEach(candidate => {
      const stage = candidate.currentInterviewStep;
      if (!kanbanColumns[stage]) {
        kanbanColumns[stage] = [];
      }
      kanbanColumns[stage].push(candidate);
    });
    console.log('Kanban Board:', kanbanColumns);
  })
  .catch(error => console.error('Error:', error));
```

---

### 2. Actualizar Etapa de Candidato

**Endpoint:** `PUT /api/candidates/:id/stage`

**Descripción:** Actualiza la etapa actual del proceso de entrevista para un candidato específico.

#### Request

```bash
PUT http://localhost:3010/api/candidates/1/stage
Content-Type: application/json

{
  "applicationId": 5,
  "newInterviewStepId": 3
}
```

#### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `applicationId` | number | Sí | ID de la aplicación a actualizar |
| `newInterviewStepId` | number | Sí | ID de la nueva etapa del proceso |

#### Response Exitoso (200)

```json
{
  "message": "Stage updated successfully",
  "application": {
    "id": 5,
    "currentInterviewStep": 3,
    "updatedAt": "2025-11-24T10:30:00.000Z"
  }
}
```

#### Reglas de Negocio

El sistema valida las siguientes reglas antes de actualizar:

1. ✅ **No se pueden saltar etapas:** Solo se puede avanzar o retroceder 1 paso
2. ✅ **Mismo flujo:** La nueva etapa debe pertenecer al mismo flujo de entrevistas
3. ✅ **Retroceso limitado:** Solo se puede retroceder 1 paso a la vez
4. ✅ **Validación de pertenencia:** La aplicación debe pertenecer al candidato especificado

#### Ejemplos de Validaciones

```javascript
// ✅ VÁLIDO: Avanzar una etapa
{
  "applicationId": 5,
  "newInterviewStepId": 3  // De orderIndex 2 → 3
}

// ✅ VÁLIDO: Retroceder una etapa
{
  "applicationId": 5,
  "newInterviewStepId": 1  // De orderIndex 2 → 1
}

// ❌ INVÁLIDO: Saltar etapas
{
  "applicationId": 5,
  "newInterviewStepId": 4  // De orderIndex 2 → 4 (salta la 3)
}
// Error: "Cannot skip stages in the interview process"

// ❌ INVÁLIDO: Retroceder más de un paso
{
  "applicationId": 5,
  "newInterviewStepId": 1  // De orderIndex 3 → 1
}
// Error: "Can only move back one stage at a time"
```

#### Ejemplo con cURL

```bash
# Actualizar candidato 1 a la etapa 3
curl -X PUT http://localhost:3010/api/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": 5,
    "newInterviewStepId": 3
  }'
```

#### Ejemplo con JavaScript (Fetch API)

```javascript
const candidateId = 1;
const updateData = {
  applicationId: 5,
  newInterviewStepId: 3
};

fetch(`http://localhost:3010/api/candidates/${candidateId}/stage`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
})
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(result => {
    console.log('Success:', result.message);
    console.log('New stage:', result.application.currentInterviewStep);
  })
  .catch(error => console.error('Error:', error));
```

---

## Códigos de Error

### Errores del Cliente (4xx)

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| `400` | Datos inválidos o faltantes | ID inválido, campos requeridos faltantes |
| `404` | Recurso no encontrado | Candidato, aplicación o etapa no existe |
| `422` | Regla de negocio violada | Saltar etapas, flujo incorrecto |

### Errores del Servidor (5xx)

| Código | Descripción |
|--------|-------------|
| `500` | Error interno del servidor |

### Formato de Errores

```json
{
  "status": "error",
  "message": "Cannot skip stages in the interview process"
}
```

---

## Flujo de Trabajo Típico

### 1. Cargar Kanban Board Inicial

```javascript
// 1. Obtener todas las etapas del flujo (endpoint futuro)
// 2. Obtener candidatos de la posición
const positionId = 1;
const candidates = await fetch(`/api/positions/${positionId}/candidates`)
  .then(r => r.json());

// 3. Agrupar por etapa
const board = {};
candidates.forEach(c => {
  if (!board[c.currentInterviewStep]) {
    board[c.currentInterviewStep] = [];
  }
  board[c.currentInterviewStep].push(c);
});
```

### 2. Mover Candidato a Nueva Etapa (Drag & Drop)

```javascript
async function moveCandidate(candidateId, applicationId, newStepId) {
  try {
    const response = await fetch(`/api/candidates/${candidateId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId,
        newInterviewStepId: newStepId
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      alert(`Error: ${error.message}`);
      return false;
    }
    
    const result = await response.json();
    console.log('Moved successfully:', result);
    return true;
  } catch (error) {
    console.error('Error moving candidate:', error);
    return false;
  }
}
```

---

## Pruebas con la Base de Datos de Ejemplo

Si has ejecutado el seed, puedes probar con estos datos de ejemplo:

### Datos de Ejemplo Disponibles

**Posiciones:**
- Position ID 1: "Software Engineer"
- Position ID 2: "Data Scientist"

**Candidatos con Aplicaciones:**
- Candidate ID 1 (John Doe) → Application ID 1 → Position ID 1
- Candidate ID 2 (Jane Smith) → Application ID 2 → Position ID 1
- Candidate ID 3 (Carlos García) → Application ID 3 → Position ID 2

### Comandos de Prueba

```bash
# 1. Ver candidatos de Software Engineer
curl http://localhost:3010/api/positions/1/candidates

# 2. Mover John Doe a la siguiente etapa
curl -X PUT http://localhost:3010/api/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"applicationId": 1, "newInterviewStepId": 2}'

# 3. Ver candidatos de Data Scientist
curl http://localhost:3010/api/positions/2/candidates
```

---

## Consideraciones de Integración Frontend

### Estado de la Aplicación

Deberás mantener información adicional para la UI:

```typescript
interface KanbanState {
  positions: Position[];
  selectedPositionId: number;
  candidates: CandidateKanbanCard[];
  interviewSteps: InterviewStep[];  // Necesario para mostrar columnas
  loading: boolean;
  error: string | null;
}
```

### Actualización Optimista

Para mejor UX, implementa actualización optimista:

```javascript
function handleDragEnd(result) {
  // 1. Actualizar UI inmediatamente
  updateUIOptimistically(result);
  
  // 2. Hacer llamada al backend
  moveCandidate(candidateId, applicationId, newStepId)
    .then(success => {
      if (!success) {
        // 3. Revertir si falla
        revertUIChange(result);
      }
    });
}
```

---

## Próximos Pasos

### Endpoints Planeados (Fase 2)

- `GET /api/positions/:id/interview-flow` - Obtener etapas del flujo
- `POST /api/interviews` - Registrar resultado de entrevista
- `GET /api/candidates/:id/timeline` - Ver historial del candidato

### Mejoras Futuras

- WebSocket para actualizaciones en tiempo real
- Filtros avanzados (por score, por fecha)
- Paginación para grandes volúmenes
- Métricas (tiempo promedio por etapa, tasa de conversión)

---

## Soporte y Contacto

Para reportar bugs o solicitar features:
- Crear issue en el repositorio
- Documentar el caso de uso
- Incluir ejemplos de request/response

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Equipo de Desarrollo ATS

