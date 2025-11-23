# 🚀 Inicio Rápido - Frontend

## Configuración en 3 pasos

### 1️⃣ Crear archivo de variables de entorno

```bash
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3010
REACT_APP_API_TIMEOUT=30000
EOF
```

### 2️⃣ Instalar dependencias (si no están instaladas)

```bash
npm install
```

### 3️⃣ Iniciar el servidor de desarrollo

**Opción A - Script automático:**
```bash
./start-dev.sh
```

**Opción B - Comando npm:**
```bash
npm start
```

---

## ✅ Verificar configuración

```bash
./check-setup.sh
```

---

## 📱 Acceder a la aplicación

Una vez iniciado, abre tu navegador en:

👉 **http://localhost:3000**

---

## ⚠️ Requisitos previos

- ✅ Node.js 16+ instalado
- ✅ Backend corriendo en http://localhost:3010

---

## 🆘 Problemas comunes

### Error: "Cannot find module 'axios'"
```bash
npm install
```

### Error: "Port 3000 already in use"
```bash
PORT=3001 npm start
```

### Backend no responde
1. Verifica que el backend esté corriendo
2. Ejecuta en otra terminal:
```bash
cd ../backend
npm start
```

---

## 📚 Más información

- [CONFIGURACION-DEV.md](./CONFIGURACION-DEV.md) - Detalles completos de la configuración
- [SETUP-DEV.md](./SETUP-DEV.md) - Guía extendida de desarrollo
- [README.md](./README.md) - Documentación general del proyecto

---

**¡Listo para desarrollar!** 🎉

