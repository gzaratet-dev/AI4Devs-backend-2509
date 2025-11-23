# Configuración de pgAdmin para LTI Database

## 🎯 Acceso a pgAdmin

**URL:** http://localhost:5050

### Credenciales de Acceso

```
Email:    admin@lti.com
Password: admin123
```

---

## 🔌 Conectar PostgreSQL en pgAdmin

### Paso 1: Acceder a pgAdmin
1. Abrir navegador en: http://localhost:5050
2. Ingresar credenciales (admin@lti.com / admin123)

### Paso 2: Agregar Servidor PostgreSQL

**Click derecho en "Servers" → "Register" → "Server"**

#### Pestaña "General"
```
Name: LTI Database
```

#### Pestaña "Connection"
```
Host name/address: lti-postgres
Port:              5432
Maintenance database: LTIdb
Username:          LTIdbUser
Password:          D1ymf8wyQEGthFR1E9xhCq
```

✅ **Marcar:** "Save password"

#### Pestaña "Advanced"
```
DB restriction: LTIdb
```

### Paso 3: Guardar
Click en "Save"

---

## 📊 Explorar la Base de Datos

Una vez conectado, navegar a:

```
Servers
  └─ LTI Database
      └─ Databases
          └─ LTIdb
              └─ Schemas
                  └─ public
                      ├─ Tables (12 tablas)
                      │   ├─ Application
                      │   ├─ Candidate
                      │   ├─ Company
                      │   ├─ Education
                      │   ├─ Employee
                      │   ├─ Interview
                      │   ├─ InterviewFlow
                      │   ├─ InterviewStep
                      │   ├─ InterviewType
                      │   ├─ Position
                      │   ├─ Resume
                      │   └─ WorkExperience
                      └─ Views
```

---

## 🔍 Consultas Útiles

### Ver todos los candidatos
```sql
SELECT 
    id, 
    "firstName", 
    "lastName", 
    email, 
    phone 
FROM "Candidate";
```

### Ver candidatos con sus aplicaciones
```sql
SELECT 
    c."firstName" || ' ' || c."lastName" AS candidate,
    p.title AS position,
    a."applicationDate",
    a."currentInterviewStep"
FROM "Candidate" c
JOIN "Application" a ON c.id = a."candidateId"
JOIN "Position" p ON a."positionId" = p.id;
```

### Ver entrevistas realizadas
```sql
SELECT 
    c."firstName" || ' ' || c."lastName" AS candidate,
    p.title AS position,
    ist.name AS interview_step,
    i."interviewDate",
    i.result,
    i.score,
    e.name AS interviewer
FROM "Interview" i
JOIN "Application" a ON i."applicationId" = a.id
JOIN "Candidate" c ON a."candidateId" = c.id
JOIN "Position" p ON a."positionId" = p.id
JOIN "InterviewStep" ist ON i."interviewStepId" = ist.id
JOIN "Employee" e ON i."employeeId" = e.id
ORDER BY i."interviewDate" DESC;
```

### Ver posiciones y sus flujos de entrevista
```sql
SELECT 
    p.title AS position,
    p.status,
    p.location,
    if.description AS interview_flow,
    COUNT(a.id) AS applications_count
FROM "Position" p
LEFT JOIN "InterviewFlow" if ON p."interviewFlowId" = if.id
LEFT JOIN "Application" a ON p.id = a."positionId"
GROUP BY p.id, p.title, p.status, p.location, if.description;
```

---

## 🛠️ Gestionar Servicios Docker

### Ver estado de los contenedores
```bash
docker ps
```

### Ver logs de pgAdmin
```bash
docker logs lti-pgadmin
```

### Ver logs de PostgreSQL
```bash
docker logs lti-postgres
```

### Reiniciar pgAdmin
```bash
docker restart lti-pgadmin
```

### Reiniciar PostgreSQL
```bash
docker restart lti-postgres
```

### Detener todos los servicios
```bash
docker compose down
```

### Iniciar servicios
```bash
docker compose up -d
```

---

## 🌐 Información de Red

### Red Docker
```
Nombre: ai4devs-backend-2509_lti-network
Tipo:   bridge
```

### Contenedores en la Red
```
lti-postgres  (172.20.0.2)  → PostgreSQL
lti-pgadmin   (172.20.0.3)  → pgAdmin
```

### Comunicación entre Contenedores
Los contenedores pueden comunicarse usando sus nombres:
- Desde pgAdmin a PostgreSQL: `lti-postgres:5432`
- Desde host a PostgreSQL: `localhost:5432`
- Desde host a pgAdmin: `localhost:5050`

---

## 🔐 Credenciales de Referencia

### pgAdmin
```
URL:      http://localhost:5050
Email:    admin@lti.com
Password: admin123
```

### PostgreSQL (desde host)
```
Host:     localhost
Port:     5432
Database: LTIdb
User:     LTIdbUser
Password: D1ymf8wyQEGthFR1E9xhCq
```

### PostgreSQL (desde pgAdmin/contenedores)
```
Host:     lti-postgres
Port:     5432
Database: LTIdb
User:     LTIdbUser
Password: D1ymf8wyQEGthFR1E9xhCq
```

---

## ⚠️ Notas Importantes

- **Datos de Prueba:** La base de datos contiene datos de ejemplo cargados con el seed
- **Contraseñas:** Estas credenciales son solo para desarrollo local
- **Puerto 5050:** Asegúrate de que no esté en uso por otro servicio
- **Persistencia:** pgAdmin no tiene volumen persistente configurado. Las configuraciones de servidores se perderán al eliminar el contenedor

---

## 🚀 Ventajas de pgAdmin

- ✅ Interfaz gráfica completa
- ✅ Editor SQL con autocompletado
- ✅ Visualización de datos en tablas
- ✅ Exportar/Importar datos
- ✅ Diseño visual de tablas
- ✅ Estadísticas y monitoreo
- ✅ Gestión de usuarios y permisos
- ✅ Query history

---

## 🆚 Alternativa: Prisma Studio

Si prefieres una interfaz más ligera y específica para Prisma:

```bash
cd backend
npx prisma studio
```

**URL:** http://localhost:5555

**Ventajas de Prisma Studio:**
- ✅ Más ligero
- ✅ Integrado con Prisma
- ✅ Interfaz moderna y simple
- ✅ Edición directa de datos

**Ventajas de pgAdmin:**
- ✅ Más completo y profesional
- ✅ SQL queries avanzadas
- ✅ Monitoreo de rendimiento
- ✅ Gestión completa de PostgreSQL

---

## 📚 Recursos

- **pgAdmin Docs:** https://www.pgadmin.org/docs/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Docker Network:** https://docs.docker.com/network/

---

**Última actualización:** Noviembre 2025

