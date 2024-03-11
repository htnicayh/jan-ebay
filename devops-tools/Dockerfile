FROM node:18 AS BUILDER
WORKDIR /usr/src/app
COPY ["package*.json", "ts*.json", "./"]
RUN npm install
COPY ["src", "./src"]
RUN npm run build

FROM node:18
WORKDIR /usr/src/app
COPY --from=BUILDER /usr/src/app/dist ./dist
COPY --from=BUILDER /usr/src/app/node_modules ./node_modules
COPY [ "package.json", "./"]
EXPOSE 3000
CMD ["node", "dist/main.js"]