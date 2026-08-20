# ==========================================================================
# Dockerfile para Google Cloud Run
# Multi-etapa:
#   1) Node: compila el frontend React.
#   2) Python: instala el backend Flask y copia el frontend compilado.
# El contenedor resultante sirve la API y la interfaz en un solo proceso.
# ==========================================================================

# --- Etapa 1: compilar frontend -------------------------------------------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Instala dependencias (aprovecha la caché mientras no cambien package.json).
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copia el código y compila.
COPY frontend/public ./public
COPY frontend/src ./src

# La config web de Firebase (pública) se inyecta en el bundle al compilar.
COPY frontend/.env.production ./.env.production
RUN npm run build

# --- Etapa 2: runtime Python ----------------------------------------------
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8080

# Instala dependencias del backend.
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copia el backend y el frontend compilado.
COPY backend /app/backend
COPY --from=frontend-build /app/frontend/build /app/frontend/build

WORKDIR /app/backend

EXPOSE 8080

# 1 worker para entrar bien en la RAM del plan gratuito de Render.
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 1 --timeout 120 app:app