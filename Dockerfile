FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# copy source code
ADD . /usr/src/app

# Install app dependencies
RUN npm install
RUN npm run build

EXPOSE 9091

CMD [ "node", "index.js" ]
