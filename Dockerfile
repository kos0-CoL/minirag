FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

# Crear usuario no-root
RUN addgroup --system --gid 1001 minirag && \
    adduser --system --uid 1001 minirag --ingroup minirag

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias Node
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar owner
RUN chown -R minirag:minirag /app

USER minirag

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
