FROM --platform=linux/amd64 node:20-slim
WORKDIR /app
COPY . /app
RUN npm install
CMD node index.js