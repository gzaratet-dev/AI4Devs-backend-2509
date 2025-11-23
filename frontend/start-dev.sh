#!/bin/bash

# Script para iniciar el frontend en modo desarrollo

echo "🚀 Iniciando Frontend para Desarrollo"
echo "======================================"
echo ""

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️  No se encontró el archivo .env"
    echo "📝 Creando .env desde .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Archivo .env creado"
    else
        echo "❌ No se encontró .env.example"
        echo "📝 Creando .env con valores por defecto..."
        cat > .env << EOF
REACT_APP_API_URL=http://localhost:3010
REACT_APP_API_TIMEOUT=30000
EOF
        echo "✅ Archivo .env creado con valores por defecto"
    fi
    echo ""
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar que el backend esté corriendo
echo "🔍 Verificando conexión con el backend..."
BACKEND_URL=$(grep REACT_APP_API_URL .env | cut -d '=' -f2)

if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 "${BACKEND_URL}" > /dev/null 2>&1; then
        echo "✅ Backend está corriendo en ${BACKEND_URL}"
    else
        echo "⚠️  No se puede conectar al backend en ${BACKEND_URL}"
        echo "   Asegúrate de que el backend esté corriendo antes de continuar."
        echo ""
    fi
fi

echo ""
echo "🌐 Iniciando servidor de desarrollo..."
echo "   La aplicación se abrirá en http://localhost:3000"
echo ""
echo "   Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor de desarrollo
npm start

