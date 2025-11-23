# 🚀 Inicio Rápido - LTI ATS Backend

## ⚡ Configuración Inicial (Primera vez)

```bash
# 1. Iniciar servicios Docker
docker compose up -d

# 2. Instalar dependencias
cd backend
npm install

# 3. Configurar Prisma
npx prisma generate
npx prisma migrate dev

# 4. Poblar base de datos
npx tsx prisma/seed.ts

# 5. Iniciar servidor
npm run dev
```

## 🔄 Uso Diario

### Iniciar todo
```bash
# Desde la raíz del proyecto
docker compose up -d
cd backend && npm run dev
```

### Detener todo
```bash
# Ctrl+C en el terminal del servidor
docker compose down
```

## 🌐 URLs de Acceso

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Backend API** | http://localhost:3010 | - |
| **pgAdmin** | http://localhost:5050 | admin@lti.com / admin123 |
| **Prisma Studio** | http://localhost:5555 | - |
| **PostgreSQL** | localhost:5432 | LTIdbUser / D1ymf8wyQEGthFR1E9xhCq |

## 📚 Documentación

- **Análisis del Proyecto:** `backend/docs/project-description.md`
- **Instrucciones de Setup:** `backend/docs/SETUP-INSTRUCTIONS.md`
- **Configuración pgAdmin:** `backend/docs/PGADMIN-SETUP.md`

## 🧪 Prueba Rápida

```bash
# Health check
curl http://localhost:3010

# Obtener candidato
curl http://localhost:3010/candidates/1
```

## 🆘 Problemas Comunes

**Puerto ocupado:**
```bash
# Encontrar y matar proceso
lsof -ti:3010 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # PostgreSQL
lsof -ti:5050 | xargs kill -9  # pgAdmin
```

**Base de datos no responde:**
```bash
docker compose restart db
```

**Verificar ambiente:**
```bash
cd backend
./scripts/check-environment.sh
```
