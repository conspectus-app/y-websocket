FROM node:12-alpine

WORKDIR /home/node/
COPY ./package*.json ./
RUN yarn install && yarn cache clean --force
ENV PATH /home/node/node_modules/.bin:$PATH
WORKDIR /home/node/app/
COPY . .
CMD [ "npm", "start" ]
