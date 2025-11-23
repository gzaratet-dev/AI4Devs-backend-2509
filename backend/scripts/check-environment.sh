#!/bin/bash

# Script para verificar el estado del ambiente de desarrollo
# Uso: ./scripts/check-environment.sh

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Verificación del Ambiente de Desarrollo - Backend      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2"
        return 0
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

check_service() {
    if curl -s "$1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $2 ($1)"
        return 0
    else
        echo -e "${RED}✗${NC} $2 ($1)"
        return 1
    fi
}

echo "═══ HERRAMIENTAS REQUERIDAS ═══"
check_command "node" "Node.js instalado"
check_command "npm" "npm instalado"
check_command "docker" "Docker instalado"
check_command "npx" "npx disponible"

echo ""
echo "═══ SERVICIOS ═══"
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✓${NC} PostgreSQL (Docker)"
else
    echo -e "${RED}✗${NC} PostgreSQL no está corriendo"
    echo -e "   ${YELLOW}→${NC} Ejecutar: docker compose up -d"
fi

check_service "http://localhost:3010" "Backend API"
check_service "http://localhost:5555" "Prisma Studio" 2>/dev/null

echo ""
echo "═══ ARCHIVOS DE CONFIGURACIÓN ═══"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env existe"
else
    echo -e "${RED}✗${NC} .env no encontrado"
    echo -e "   ${YELLOW}→${NC} Copiar desde .env.example"
fi

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Schema de Prisma existe"
else
    echo -e "${RED}✗${NC} Schema de Prisma no encontrado"
fi

echo ""
echo "═══ DEPENDENCIAS ═══"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules instalado"
    PACKAGES=$(ls node_modules | wc -l)
    echo "   Paquetes: $PACKAGES"
else
    echo -e "${RED}✗${NC} node_modules no encontrado"
    echo -e "   ${YELLOW}→${NC} Ejecutar: npm install"
fi

if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Cliente Prisma generado"
else
    echo -e "${RED}✗${NC} Cliente Prisma no generado"
    echo -e "   ${YELLOW}→${NC} Ejecutar: npx prisma generate"
fi

echo ""
echo "═══ BASE DE DATOS ═══"
if docker ps | grep -q postgres; then
    # Intentar conectar a la base de datos
    PGPASSWORD="D1ymf8wyQEGthFR1E9xhCq" psql -h localhost -U LTIdbUser -d LTIdb -c "SELECT COUNT(*) FROM \"Candidate\";" -t 2>/dev/null | xargs | {
        read count
        if [ ! -z "$count" ]; then
            echo -e "${GREEN}✓${NC} Conexión a base de datos OK"
            echo "   Candidatos: $count"
        else
            echo -e "${YELLOW}⚠${NC} Base de datos conectada pero podría necesitar migraciones"
            echo -e "   ${YELLOW}→${NC} Ejecutar: npx prisma migrate dev"
        fi
    }
else
    echo -e "${RED}✗${NC} No se puede verificar la base de datos (PostgreSQL no está corriendo)"
fi

echo ""
echo "═══ DOCUMENTACIÓN ═══"
if [ -f "docs/project-description.md" ]; then
    SIZE=$(du -h docs/project-description.md | cut -f1)
    echo -e "${GREEN}✓${NC} project-description.md ($SIZE)"
else
    echo -e "${YELLOW}⚠${NC} project-description.md no encontrado"
fi

if [ -f "docs/SETUP-INSTRUCTIONS.md" ]; then
    SIZE=$(du -h docs/SETUP-INSTRUCTIONS.md | cut -f1)
    echo -e "${GREEN}✓${NC} SETUP-INSTRUCTIONS.md ($SIZE)"
else
    echo -e "${YELLOW}⚠${NC} SETUP-INSTRUCTIONS.md no encontrado"
fi

echo ""
echo "═══ PRUEBA DE API ═══"
if curl -s http://localhost:3010 > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:3010)
    echo -e "${GREEN}✓${NC} GET / → $RESPONSE"
    
    if curl -s http://localhost:3010/candidates/1 | grep -q "firstName"; then
        echo -e "${GREEN}✓${NC} GET /candidates/1 → Funcionando"
    else
        echo -e "${YELLOW}⚠${NC} GET /candidates/1 → Sin datos o error"
    fi
else
    echo -e "${RED}✗${NC} Servidor no responde"
    echo -e "   ${YELLOW}→${NC} Ejecutar: npm run dev"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Resumen
ERRORS=0
if ! docker ps | grep -q postgres; then ((ERRORS++)); fi
if ! curl -s http://localhost:3010 > /dev/null 2>&1; then ((ERRORS++)); fi
if [ ! -f ".env" ]; then ((ERRORS++)); fi
if [ ! -d "node_modules" ]; then ((ERRORS++)); fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo está funcionando correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Se encontraron $ERRORS problema(s)${NC}"
    echo ""
    echo "Para más ayuda, consultar:"
    echo "  → backend/docs/SETUP-INSTRUCTIONS.md"
fi

echo ""

