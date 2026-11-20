FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY src ./src

# Porta interna da API (documentação; o mapeamento real é feito no docker run -p)
EXPOSE 4000

CMD ["node", "src/server.js"]
