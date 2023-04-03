FROM node:12-alpine

WORKDIR /opt/app

ENV NODE_ENV production

COPY package*.json ./

RUN npm ci 

COPY ../app /opt/app

RUN npm install --dev && npm run build

CMD [ "npm", "start" ]
