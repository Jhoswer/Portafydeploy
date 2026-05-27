#!/bin/bash

# ══════════════════════════════════════════════════════════════
#  sync-deploy.sh — Sincroniza dev repos → Portafydeploy
#  Uso: bash sync-deploy.sh
#       bash sync-deploy.sh "mensaje del commit"
# ══════════════════════════════════════════════════════════════

# ── Rutas (ajusta si algo cambia) ─────────────────────────────
DEPLOY_DIR="$HOME/Documents/umss/materias/TIS-P/PortifyDeploy/deploy2"
BACKEND_SRC="$HOME/Documents/umss/materias/TIS-P/Proyecto-TIS/qa/QAtests/main/backend"
FRONTEND_SRC="$HOME/Documents/umss/materias/TIS-P/Proyecto-TIS/qa/QAtests/main/frontend"
# ──────────────────────────────────────────────────────────────

set -e  # detener si algo falla

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Portafy Deploy Sync v1.0       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Verificar que existen las rutas ───────────────────────────
if [ ! -d "$DEPLOY_DIR" ]; then
  echo -e "${RED}✗ No se encontró el repo deploy: $DEPLOY_DIR${NC}"
  exit 1
fi
if [ ! -d "$BACKEND_SRC" ]; then
  echo -e "${RED}✗ No se encontró el backend dev: $BACKEND_SRC${NC}"
  exit 1
fi
if [ ! -d "$FRONTEND_SRC" ]; then
  echo -e "${RED}✗ No se encontró el frontend dev: $FRONTEND_SRC${NC}"
  exit 1
fi

cd "$DEPLOY_DIR"

# ── 1. Guardar Dockerfile (no está en el repo dev) ────────────
echo -e "${YELLOW}► Guardando Dockerfile...${NC}"
cp backend/Dockerfile /tmp/Dockerfile.backup

# ── 2. Sincronizar backend ────────────────────────────────────
echo -e "${YELLOW}► Sincronizando backend...${NC}"
rm -rf backend
cp -r "$BACKEND_SRC" backend

# Limpiar lo que no debe subir a git
rm -rf backend/vendor
rm -rf backend/.git
rm -f  backend/.env

# Restaurar Dockerfile
cp /tmp/Dockerfile.backup backend/Dockerfile
echo -e "${GREEN}  ✓ Backend sincronizado${NC}"

# ── 3. Sincronizar frontend ───────────────────────────────────
echo -e "${YELLOW}► Sincronizando frontend...${NC}"
rm -rf frontend
cp -r "$FRONTEND_SRC" frontend

# Limpiar lo que no debe subir a git
rm -rf frontend/node_modules
rm -rf frontend/.git
rm -f  frontend/.env
rm -f  frontend/.env.local
rm -rf frontend/dist
echo -e "${GREEN}  ✓ Frontend sincronizado${NC}"

# ── 4. Commit y push ──────────────────────────────────────────
echo -e "${YELLOW}► Subiendo cambios a GitHub...${NC}"

COMMIT_MSG="${1:-update: sync cambios desde repos de desarrollo}"

git add .

# Si no hay cambios, avisar y salir sin error
if git diff --cached --quiet; then
  echo -e "${YELLOW}  ⚠ No hay cambios nuevos para subir.${NC}"
  exit 0
fi

git commit -m "$COMMIT_MSG"
git push origin main

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Deploy actualizado exitosamente   ║${NC}"
echo -e "${GREEN}║  Render redesplegará en ~1-2 min     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""