# Frontend - LTI Recruiting Platform

Frontend de la plataforma de reclutamiento LTI, construido con React y TypeScript.

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 16.x o superior
- npm 8.x o superior
- Backend corriendo en `http://localhost:3010`

### Instalación y Ejecución

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus configuraciones
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm start
# o usar el script incluido
./start-dev.sh
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes y recursos
│   ├── components/        # Componentes React
│   │   ├── AddCandidateForm.js
│   │   ├── FileUploader.js
│   │   └── RecruiterDashboard.js
│   ├── config/            # Configuración
│   │   └── api.config.js  # Configuración de la API
│   ├── services/          # Servicios para API calls
│   │   └── candidateService.js
│   ├── App.tsx            # Componente principal
│   └── index.tsx          # Punto de entrada
├── .env.example           # Ejemplo de variables de entorno
├── package.json           # Dependencias y scripts
└── tsconfig.json          # Configuración de TypeScript
```

## 🛠️ Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Crea un build de producción
- `npm test` - Ejecuta los tests
- `./start-dev.sh` - Script helper para iniciar en modo desarrollo

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
REACT_APP_API_URL=http://localhost:3010
REACT_APP_API_TIMEOUT=30000
```

| Variable | Descripción | Por Defecto |
|----------|-------------|-------------|
| `REACT_APP_API_URL` | URL del backend API | `http://localhost:3010` |
| `REACT_APP_API_TIMEOUT` | Timeout para peticiones HTTP (ms) | `30000` |

## 🔧 Tecnologías

- **React 18.3.1** - Librería UI
- **TypeScript 4.9.5** - Tipado estático
- **React Bootstrap 2.10.2** - Componentes UI
- **React Router DOM 6.23.1** - Enrutamiento
- **Axios 1.6.8** - Cliente HTTP
- **React Scripts 5.0.1** - Tooling de Create React App

## 🐛 Troubleshooting

### Error de CORS

Si experimentas errores de CORS, verifica que:
1. El backend esté corriendo en `http://localhost:3010`
2. El backend tenga configurado CORS para aceptar peticiones desde `http://localhost:3000`
3. La variable `REACT_APP_API_URL` esté correctamente configurada

### Puerto 3000 ocupado

Si el puerto está en uso, puedes especificar otro:
```bash
PORT=3001 npm start
```

### Dependencias faltantes

Si encuentras errores de módulos faltantes:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentación Adicional

- [SETUP-DEV.md](./SETUP-DEV.md) - Guía detallada de configuración
- [Create React App Docs](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)

## 🤝 Contribuir

1. Asegúrate de que el código pase los tests
2. Sigue las convenciones de código del proyecto
3. Actualiza la documentación según sea necesario

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
