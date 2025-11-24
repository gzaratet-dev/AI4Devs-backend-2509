# Prompts
 
### Cloude Sonet 4.5

---

## Prompt 1: Analisis del proyecto

**Rol:** Eres un arquitecto de software con experiencia en sistema de software ATS(Applicant-Tracking System)

**Objetivo:** Analizar el proyecto, revisa la estructura, entidades, ERD,  diseño ER, stack tecnológico, operaciones técnicas, etc.

**Entrada:** `backend`

**Salida:** Archivo con el analisis del proyecto `backend/docs/project-description.md

## Prompt 2: Crear el plan para la implementación de dos nuevos endpoints

**Rol:** Eres un arquitecto de software con experiencia en sistema de software ATS(Applicant-Tracking System), especializado en javascript/typescript y prisma ORM. 

**Objetivo:** Hacer un plan de implementación que construya  nuevos endpoints que permitan manipular la lista de candidatos en una interfaz tipo kanban.

**Entrada:** `backend/docs/project-description`

**Instrucciones**

#### **Guía de Buenas Prácticas Proyecto LTI**

##### **1. Domain-Driven Design (DDD)**

-   _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:
    
-   **Value Objects:**  Objetos que describen aspectos del dominio sin identidad conceptual.
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:
    
-   **Agregados:**  Conjuntos de objetos que deben ser tratados como una unidad.
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:
    
-   **Repositorios:**  Interfaces que proporcionan acceso a agregados y entidades.
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:
    
-   **Servicios de Dominio:**  Lógica de negocio que no pertenece naturalmente a una entidad o valor.
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:
    

##### **2. Principios SOLID y DRY**

-   **S - Single Responsibility Principle (SRP):**  
      
    _Antes_
-   ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:  
      
    
-   **O - Open/Closed Principle (OCP):**
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:  
      
    
-   **L - Liskov Substitution Principle (LSP):**
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:  
      
    
-   **I - Interface Segregation Principle (ISP):**
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:  
      
    
-   **D - Dependency Inversion Principle (DIP):**
    
    _Antes_
    
    ```
      
    ```
    
    _Después_
    
    ```
      
    ```
    
    Explicación:  
    
-   **DRY (Don't Repeat Yourself)**
-   _Antes_
-   ```
      
    ```
    
-   _Después_
-   ```
      
    ```
    

...(añadir patrones de diseño o cualquier otra práctica sobre la que se requiera descripción y ejemplos)

- Primer endpoint: **GET  positions/:id/candidates** Este endpoint debe devolver todos los candidatos que se encuentran actualmente en proceso para un puesto determinado, es decir, todas las solicitudes asociadas a un puesto específico (positionID). - Debe devolver la siguiente información básica:
  - El nombre completo del candidato (de la tabla de candidatos). current_interview_step: la etapa del proceso de entrevista en la que se encuentra actualmente el candidato (de la tabla de solicitudes). La puntuación media del candidato. Recuerde que cada entrevista realizada al candidato tiene una puntuación.
 - Segundo endpoint: **PUT /candidates/:id/stage** Este endpoint actualiza la etapa del candidato que se está moviendo en el tablero Kanban. Debe permitir modificar el paso de entrevista actual de un candidato específico.
 - **Nada de código aún, solo el plan**

**Salida:** Archivo markdown con el plan para implementar los endpoints en: `backend/docs/implementation-plan-kanban-endpoints.md`

## Prompt 3: Implementar plan

**Rol:** Eres un ingeniero de software experto en Typescript, Prisma, Express, TDD y con experiencia en sistema de software ATS(Applicant-Tracking System)

**Objetivo:** Implementar los endpoints siguiendo el plan descrito en el archivo de entrada.

**Entrada:** `backend/docs/implementation-plan-kanban-endpoints.md`

**Instrucciones:**
- Ejecutar el plan por fases.
- Comenzar plan implementando solo las pruebas unitarias (los test de integración y los test E2E se harán en una etapa posterior).
- Seguir la secuencia lógica de implementación
- Seguir buenas prácticas indicadas en el documento.es necesario. 

**Salida:** Una vez terminado el plan, actualizar la documentación de ambos archivos: `backend/docs/project-description.md` y `backend/docs/implementation-plan-kanban-endpoints.md` para la siguientes etapas de implementación.
- Preguntar si es necesario. 

**Salida:** Una vez terminado el plan, actualizar la documentación de ambos archivos: `backend/docs/project-description.md` y `backend/docs/implementation-plan-kanban-endpoints.md` para la siguientes etapas de implementación.

## Prompt 4: Validar los endpoints

**Rol:** Eres un ingeniero de software  con experiencia en sistema de software ATS(Applicant-Tracking System)

**Objetivo:** Validar los endpoints implementados.

### Validación

- [ ] Probar GET /positions/:id/candidates con Postman/Thunder Client

- [ ] Probar PUT /candidates/:id/stage con casos válidos

- [ ] Probar casos de error (IDs inválidos, transiciones no permitidas)

- [ ] Verificar que los promedios se calculan correctamente

- [ ] Verificar manejo de errores en todos los endpoints

**Salida:** Una vez terminado actualiza la documentación que corresponda en `backend/docs`