# Frontend - Configuración para Desarrollo

Este documento describe cómo configurar y ejecutar el frontend para desarrollo.

## Requisitos Previos

- Node.js 16.x o superior
- npm 8.x o superior
- Backend ejecutándose en `http://localhost:3010`

## Instalación

1. **Instalar dependencias:**

```bash
cd frontend
npm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env` en la raíz del directorio `frontend` basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y ajusta las variables según tu entorno:

```env
REACT_APP_API_URL=http://localhost:3010
REACT_APP_API_TIMEOUT=30000
```

## Ejecución

### Modo Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

La aplicación se abrirá automáticamente en [http://localhost:3000](http://localhost:3000).

- La página se recargará automáticamente cuando hagas cambios
- Verás errores de lint en la consola

### Build de Producción

Para crear un build optimizado para producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `build/`.

### Tests

Para ejecutar los tests:

```bash
npm test
```

## Estructura del Proyecto

```
frontend/
├── public/                 # Archivos públicos estáticos
├── src/
│   ├── assets/            # Imágenes y recursos
│   ├── components/        # Componentes React
│   ├── config/            # Archivos de configuración
│   │   └── api.config.js  # Configuración de la API
│   ├── services/          # Servicios para llamadas a la API
│   ├── App.tsx            # Componente principal
│   └── index.tsx          # Punto de entrada
├── .env                   # Variables de entorno (no versionado)
├── .env.example           # Ejemplo de variables de entorno
├── package.json           # Dependencias y scripts
└── tsconfig.json          # Configuración de TypeScript
```

## Tecnologías Utilizadas

- **React 18.3.1**: Librería para construir interfaces de usuario
- **TypeScript 4.9.5**: Superset de JavaScript con tipado estático
- **React Bootstrap 2.10.2**: Componentes de Bootstrap para React
- **React Router DOM 6.23.1**: Enrutamiento para aplicaciones React
- **Axios 1.6.8**: Cliente HTTP para realizar peticiones a la API
- **React Scripts 5.0.1**: Scripts y configuración de Create React App

## Variables de Entorno

| Variable | Descripción | Por Defecto |
|----------|-------------|-------------|
| `REACT_APP_API_URL` | URL base del backend API | `http://localhost:3010` |
| `REACT_APP_API_TIMEOUT` | Timeout para las peticiones HTTP (ms) | `30000` |

## Configuración del Backend

El frontend está configurado para conectarse al backend a través de las variables de entorno. Asegúrate de que el backend esté ejecutándose antes de iniciar el frontend.

### Proxy de Desarrollo

El `package.json` incluye una configuración de proxy para facilitar el desarrollo:

```json
"proxy": "http://localhost:3010"
```

Esto permite hacer peticiones relativas sin CORS durante el desarrollo.

## Troubleshooting

### Error: Cannot find module 'axios'

Si encuentras este error, asegúrate de haber instalado las dependencias:

```bash
npm install
```

### Error de CORS

Si experimentas errores de CORS:

1. Verifica que el backend esté configurado para aceptar peticiones desde `http://localhost:3000`
2. Verifica que la variable `REACT_APP_API_URL` esté correctamente configurada
3. Asegúrate de que el proxy en `package.json` apunte al backend correcto

### El puerto 3000 ya está en uso

Si el puerto 3000 está ocupado, puedes usar otro puerto:

```bash
PORT=3001 npm start
```

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run build`: Crea un build de producción
- `npm test`: Ejecuta los tests
- `npm run eject`: Expone la configuración de Create React App (irreversible)

## Notas Adicionales

- Este proyecto usa Create React App (CRA) como base
- No se recomienda hacer `eject` a menos que sea absolutamente necesario
- Los cambios en los archivos `.env` requieren reiniciar el servidor de desarrollo

