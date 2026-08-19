# ==========================================================================
# Dockerfile para Google Cloud Run
# Multi-etapa:
#   1) Node: compila el frontend React.
#   2) Python: instala el backend Flask y copia el frontend compilado.
# El contenedor resultante sirve la API y la interfaz en un solo proceso.
# ==========================================================================

# --- Etapa 1: compilar frontend -------------------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Instala dependencias (aprovecha la caché mientras no cambien package.json).
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copia el código y compila.
COPY frontend/public ./public
COPY frontend/src ./src
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

# Cloud Run inyecta la variable PORT (default 8080) al contenedor.
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 120 app:app