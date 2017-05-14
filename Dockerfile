FROM node:7

RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /git/frontend
RUN npm install -g polymer-cli bower

COPY package.json /git/frontend/
RUN npm install --production

COPY bower.json /git/frontend/
RUN bower install --allow-root

COPY . /git/frontend/
RUN polymer build

CMD [ "npm", "start" ]