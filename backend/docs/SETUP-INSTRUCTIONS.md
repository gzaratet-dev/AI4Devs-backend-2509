# Guía de Configuración del Ambiente de Desarrollo - Backend

## ✅ Estado Actual: COMPLETADO

El ambiente de desarrollo del backend ha sido configurado exitosamente.

---

## 🎯 Servicios en Ejecución

### 1. PostgreSQL (Docker)
- **Estado:** ✅ Corriendo
- **Puerto:** 5432
- **Base de datos:** LTIdb
- **Usuario:** LTIdbUser
- **Contenedor:** `ai4devs-backend-2509-db-1`

**Verificar estado:**
```bash
docker ps | grep postgres
```

### 2. Backend API Server
- **Estado:** ✅ Corriendo
- **URL:** http://localhost:3010
- **Modo:** Desarrollo (hot-reload activado)
- **PID:** Consultar terminal 5

**Verificar estado:**
```bash
curl http://localhost:3010
# Respuesta esperada: "Hola LTI!"
```

### 3. Prisma Studio (Opcional)
- **Puerto:** 5555
- **URL:** http://localhost:5555
- **Uso:** Interfaz gráfica para explorar la base de datos

---

## 📁 Archivos de Configuración Creados

### .env
Archivo de variables de entorno (ignorado por git):
```bash
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### .env.example
Template de variables de entorno (versionado en git)

---

## 🗃️ Base de Datos

### Estado
- ✅ Migraciones aplicadas (4 migraciones)
- ✅ Datos de prueba cargados (seed)

### Datos de Ejemplo Disponibles

**Empresas:**
- LTI

**Posiciones:**
- Software Engineer (ID: 1)
- Data Scientist (ID: 2)

**Candidatos:**
- John Doe (ID: 1) - john.doe@gmail.com
- Jane Smith (ID: 2) - jane.smith@gmail.com
- Carlos García (ID: 3) - carlos.garcia@example.com

**Aplicaciones:**
- 4 aplicaciones creadas con entrevistas asociadas

**Empleados:**
- Alice Johnson - Interviewer
- Bob Miller - Hiring Manager

**Tipos de Entrevista:**
- HR Interview
- Technical Interview
- Hiring Manager Interview

**Flujos de Entrevista:**
- Standard development interview process
- Data science interview process

---

## 🧪 Pruebas de Funcionamiento

### Test 1: Verificar servidor
```bash
curl http://localhost:3010
# Respuesta: Hola LTI!
```

### Test 2: Obtener candidato por ID
```bash
curl http://localhost:3010/candidates/1
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "educations": [...],
  "workExperiences": [...],
  "resumes": [...],
  "applications": [...]
}
```

### Test 3: Crear nuevo candidato
```bash
curl -X POST http://localhost:3010/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "lastName": "González",
    "email": "maria.gonzalez@example.com",
    "phone": "612345678",
    "address": "Calle Principal 123",
    "educations": [
      {
        "institution": "Universidad Complutense",
        "title": "Ingeniería Informática",
        "startDate": "2015-09-01",
        "endDate": "2019-06-30"
      }
    ],
    "workExperiences": [
      {
        "company": "Tech Corp",
        "position": "Developer",
        "description": "Full stack development",
        "startDate": "2019-07-01",
        "endDate": "2023-12-31"
      }
    ]
  }'
```

---

## 📦 Dependencias Instaladas

```bash
# Dependencias de producción
✅ @prisma/client: 5.13.0
✅ express: 4.19.2
✅ cors: 2.8.5
✅ dotenv: 16.4.5
✅ multer: 1.4.5-lts.1

# Dependencias de desarrollo
✅ typescript: 4.9.5
✅ prisma: 5.13.0
✅ ts-node-dev: 1.1.6
✅ jest: 29.7.0
```

**Nota:** Se detectaron 12 vulnerabilidades (4 low, 4 moderate, 4 high).
Para corregirlas ejecutar: `npm audit fix`

---

## 🚀 Comandos Útiles

### Iniciar Servicios

```bash
# 1. Iniciar PostgreSQL (si no está corriendo)
docker compose up -d

# 2. Iniciar servidor de desarrollo
cd backend
npm run dev
```

### Detener Servicios

```bash
# Detener servidor de desarrollo
# Ctrl + C en la terminal donde está corriendo

# Detener PostgreSQL
docker compose down

# Detener Prisma Studio (si está corriendo)
# Buscar y matar el proceso
lsof -ti:5555 | xargs kill -9
```

### Base de Datos

```bash
# Ver datos en interfaz gráfica
npx prisma studio

# Resetear base de datos (¡cuidado! elimina todos los datos)
npx prisma migrate reset

# Poblar con datos de ejemplo
npx tsx prisma/seed.ts

# Crear nueva migración
npx prisma migrate dev --name descripcion_del_cambio

# Generar cliente Prisma después de cambios en schema
npx prisma generate
```

### Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start

# Ejecutar tests (cuando se implementen)
npm test
```

### Docker

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de PostgreSQL
docker compose logs db -f

# Acceder al shell de PostgreSQL
docker compose exec db psql -U LTIdbUser -d LTIdb

# Reiniciar contenedor de base de datos
docker compose restart db
```

---

## 📊 Endpoints API Disponibles

### Candidatos

```
GET    /candidates/:id       - Obtener candidato por ID
POST   /candidates           - Crear nuevo candidato
```

### Archivos

```
POST   /upload               - Subir archivo (PDF/DOCX, max 10MB)
```

### Health Check

```
GET    /                     - Verificar que el servidor está activo
```

---

## 🔧 Troubleshooting

### Problema: Puerto 3010 ya en uso
```bash
# Encontrar proceso
lsof -ti:3010

# Matar proceso
lsof -ti:3010 | xargs kill -9
```

### Problema: Puerto 5432 ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :5432

# Detener PostgreSQL local si existe
sudo systemctl stop postgresql
```

### Problema: Error de conexión a base de datos
```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Reiniciar contenedor
docker compose restart db

# Ver logs
docker compose logs db
```

### Problema: Error en migraciones de Prisma
```bash
# Resetear base de datos (elimina datos)
npx prisma migrate reset

# Regenerar cliente
npx prisma generate
```

### Problema: Dependencias no instaladas
```bash
cd backend
npm install
npx prisma generate
```

---

## 📝 Notas Importantes

### Seguridad
⚠️ **IMPORTANTE:** El archivo `.env` contiene credenciales sensibles y está ignorado por git. No compartir estas credenciales.

⚠️ Las credenciales actuales son de desarrollo. Para producción usar credenciales seguras y variables de entorno.

### Limitaciones Conocidas
- Sin autenticación implementada (endpoints públicos)
- Solo endpoints de candidatos disponibles
- Manejo básico de errores
- Sin tests implementados
- Vulnerabilidades en dependencias

### Próximos Pasos Recomendados
1. Implementar autenticación JWT
2. Completar endpoints de Position, Application, Interview
3. Agregar tests unitarios
4. Corregir vulnerabilidades: `npm audit fix`
5. Implementar paginación en listados

---

## 📚 Recursos

- **Documentación Prisma:** https://www.prisma.io/docs
- **Documentación Express:** https://expressjs.com
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Análisis del Proyecto:** `backend/docs/project-description.md`

---

## 🎉 ¡Listo para Desarrollar!

El ambiente de desarrollo está completamente configurado y listo para usar.

**Servidor backend:** http://localhost:3010  
**Prisma Studio:** http://localhost:5555  
**Base de datos:** localhost:5432

Para comenzar a desarrollar:
```bash
cd backend
npm run dev
```

¡Happy coding! 🚀

