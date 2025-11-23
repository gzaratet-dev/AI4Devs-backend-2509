# LTI Backend - ATS (Applicant Tracking System)

Backend del sistema de seguimiento de candidatos desarrollado con Node.js, TypeScript, Express y Prisma ORM.

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 20.x o superior
- Docker y Docker Compose
- PostgreSQL (via Docker)

### Configuración Inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar base de datos
cd ..
docker compose up -d

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Generar cliente Prisma
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Poblar base de datos con datos de ejemplo
npx tsx prisma/seed.ts

# 7. Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: **http://localhost:3010**

## 📚 Documentación

- **[Análisis Completo del Proyecto](docs/project-description.md)** - Arquitectura, modelo de datos, stack tecnológico
- **[Guía de Configuración](docs/SETUP-INSTRUCTIONS.md)** - Instrucciones detalladas de setup y comandos útiles

## 🔌 API Endpoints

### Candidatos
```
GET    /candidates/:id       - Obtener candidato por ID
POST   /candidates           - Crear nuevo candidato
```

### Archivos
```
POST   /upload               - Subir archivo (PDF/DOCX, max 10MB)
```

### Ejemplo de uso
```bash
# Obtener candidato
curl http://localhost:3010/candidates/1

# Crear candidato
curl -X POST http://localhost:3010/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "phone": "612345678",
    "address": "Calle Mayor 1",
    "educations": [{
      "institution": "Universidad",
      "title": "Ingeniería",
      "startDate": "2015-09-01",
      "endDate": "2019-06-30"
    }]
  }'
```

## 🗃️ Base de Datos

### Gestión de Base de Datos

#### Opción 1: Prisma Studio (Ligero)
```bash
npx prisma studio
```
Abre en: http://localhost:5555

#### Opción 2: pgAdmin (Completo)
```bash
# Ya está corriendo con docker compose
# Acceder en: http://localhost:5050
# Credenciales: admin@lti.com / admin123
```

Ver guía completa: [docs/PGADMIN-SETUP.md](docs/PGADMIN-SETUP.md)

### Entidades Principales
- **Candidate** - Candidatos
- **Position** - Posiciones laborales
- **Application** - Aplicaciones de candidatos
- **Interview** - Entrevistas realizadas
- **InterviewFlow** - Flujos de entrevista
- **Company** - Empresas
- **Employee** - Empleados/Entrevistadores

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Iniciar en modo desarrollo (hot-reload)
npm run build        # Compilar TypeScript
npm start            # Ejecutar versión compilada
npm test             # Ejecutar tests (cuando estén implementados)
```

## 📦 Stack Tecnológico

- **Runtime:** Node.js 20.x
- **Lenguaje:** TypeScript 4.9.5
- **Framework Web:** Express 4.19.2
- **ORM:** Prisma 5.13.0
- **Base de Datos:** PostgreSQL (Docker)
- **Validación:** Custom validators
- **Upload:** Multer
- **CORS:** cors

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── domain/          # Modelos de dominio
│   ├── application/     # Servicios y lógica de aplicación
│   ├── presentation/    # Controladores HTTP
│   └── routes/          # Definición de rutas
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   ├── migrations/      # Migraciones
│   └── seed.ts          # Datos de ejemplo
└── docs/                # Documentación
```

**Patrón:** Arquitectura en capas (Layered Architecture)

## ⚠️ Limitaciones Conocidas

- ❌ Sin autenticación implementada (endpoints públicos)
- ❌ Solo CRUD de candidatos disponible
- ❌ Sin tests unitarios/integración
- ❌ Manejo básico de errores
- ❌ Sin paginación en listados

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este proyecto está en desarrollo y NO es apto para producción.

Falta implementar:
- Sistema de autenticación (JWT)
- Autorización basada en roles
- Rate limiting
- Validación más robusta
- Sanitización de inputs

## 📝 Próximos Pasos

1. Implementar autenticación JWT
2. Completar CRUD de Position, Application, Interview
3. Agregar tests unitarios y de integración
4. Implementar paginación
5. Mejorar manejo de errores
6. Agregar logging estructurado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Ver archivo LICENSE.md en el directorio raíz.

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025

