FROM node:12.18.1
WORKDIR /user/src/app
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "start"]