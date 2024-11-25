FROM node:22.11.0 AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i

COPY . .
RUN npx prisma generate
RUN npm run build


# as runtime
FROM node:22-slim

RUN apt-get update -qq && \
  apt-get install -y openssl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .
RUN npm i --production

EXPOSE 3000
# CMD ["npm", "run", "start:prod"]
# CMD npm run start:prod
