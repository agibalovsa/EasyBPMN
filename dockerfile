FROM node:22 AS node

RUN mkdir /tmp/bpmn-io
WORKDIR /tmp/bpmn-io

COPY app/ ./app
COPY resources/ ./resources
COPY [ "package.json", "package-lock.json", "webpack.config.js", "./"]

RUN npm install -g http-server \
    && npm install \
    && npm run build

FROM nginx:1.25.5-alpine

COPY --from=node /tmp/bpmn-io/public /usr/share/nginx/html

CMD [ "nginx", "-g", "daemon off;" ]