#!/bin/bash

# Script para verificar la configuración del frontend

echo "🔍 Verificando configuración del Frontend"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
errors=0
warnings=0

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js no está instalado"
    ((errors++))
fi
echo ""

# Verificar npm
echo "📦 Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm instalado: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm no está instalado"
    ((errors++))
fi
echo ""

# Verificar node_modules
echo "📦 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules encontrado"
else
    echo -e "${YELLOW}⚠${NC} node_modules no encontrado"
    echo "   Ejecuta: npm install"
    ((warnings++))
fi
echo ""

# Verificar archivo .env
echo "⚙️  Verificando variables de entorno..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Archivo .env encontrado"
    
    # Verificar variables requeridas
    if grep -q "REACT_APP_API_URL" .env; then
        API_URL=$(grep REACT_APP_API_URL .env | cut -d '=' -f2)
        echo -e "${GREEN}✓${NC} REACT_APP_API_URL configurado: $API_URL"
    else
        echo -e "${RED}✗${NC} REACT_APP_API_URL no configurado"
        ((errors++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Archivo .env no encontrado"
    echo "   Crea el archivo .env desde .env.example"
    echo "   Ejecuta: cp .env.example .env"
    ((warnings++))
fi
echo ""

# Verificar archivo .env.example
echo "📄 Verificando archivos de configuración..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example encontrado"
else
    echo -e "${YELLOW}⚠${NC} .env.example no encontrado"
    ((warnings++))
fi
echo ""

# Verificar archivos de configuración críticos
echo "📁 Verificando estructura del proyecto..."
critical_files=(
    "package.json"
    "tsconfig.json"
    "public/index.html"
    "src/index.tsx"
    "src/App.tsx"
    "src/config/api.config.js"
    "src/services/candidateService.js"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file no encontrado"
        ((errors++))
    fi
done
echo ""

# Verificar backend
echo "🔌 Verificando conexión con el backend..."
if [ -f ".env" ]; then
    BACKEND_URL=$(grep REACT_APP_API_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
elif [ -f ".env.example" ]; then
    BACKEND_URL=$(grep REACT_APP_API_URL .env.example | cut -d '=' -f2 | tr -d '"' | tr -d "'")
else
    BACKEND_URL="http://localhost:3010"
fi

if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 "${BACKEND_URL}" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend accesible en ${BACKEND_URL}"
    else
        echo -e "${YELLOW}⚠${NC} No se puede conectar al backend en ${BACKEND_URL}"
        echo "   Asegúrate de iniciar el backend antes del frontend"
        ((warnings++))
    fi
else
    echo -e "${YELLOW}⚠${NC} curl no disponible, no se puede verificar el backend"
    ((warnings++))
fi
echo ""

# Resumen
echo "=========================================="
echo "📊 Resumen de la verificación"
echo "=========================================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Todo está configurado correctamente"
    echo ""
    echo "Para iniciar el frontend, ejecuta:"
    echo "  npm start"
    echo "  o"
    echo "  ./start-dev.sh"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠${NC} Configuración correcta con ${warnings} advertencia(s)"
    echo ""
    echo "Puedes iniciar el frontend, pero revisa las advertencias."
    exit 0
else
    echo -e "${RED}✗${NC} Se encontraron ${errors} error(es) y ${warnings} advertencia(s)"
    echo ""
    echo "Por favor, corrige los errores antes de continuar."
    exit 1
fi

