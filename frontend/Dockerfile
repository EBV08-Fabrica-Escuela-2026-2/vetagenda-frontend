# ── Stage 1: Build ────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (cacheable)
COPY package*.json ./
RUN npm ci --silent

# Recibir la URL del backend en build-time
ARG VITE_API_URL=http://localhost:8080/api
ENV VITE_API_URL=$VITE_API_URL

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
