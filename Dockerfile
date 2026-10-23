FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Dashboards salvos ficam no volume; os exemplos vêm junto com o código (data/layouts-examples)
ENV PORT=3000 DATA_PATH=/data
EXPOSE 3000

CMD ["node", "server.js"]
