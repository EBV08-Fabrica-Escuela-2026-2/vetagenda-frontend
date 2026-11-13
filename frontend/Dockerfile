# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (cacheable)
COPY package*.json ./
RUN npm ci --silent

# URL del backend en build-time. Si se deja vacía, la app arranca en modo demo.
ARG VITE_API_URL=
ARG VITE_DATA_SOURCE=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE

# Copiar fuente y compilar
COPY . .
RUN npm run build

# ── Stage 2: Serve con Nginx ───────────────────────────────────────
FROM nginx:stable-alpine

# Configuración personalizada de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
