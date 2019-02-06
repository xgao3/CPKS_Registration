FROM python:3.6-alpine
WORKDIR /usr/src/cloudpks_onboard
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY package.json .
RUN apk add --update nodejs nodejs-npm

RUN npm install
COPY app ./app
COPY cloudpks ./cloudpks
COPY config ./config
COPY node_modules ./node_modules
COPY server.js .
COPY node_js.py . 
CMD ["sh", "-c", "node app/routes/db-create.js && sleep 1 && /usr/src/cloudpks_onboard/node_modules/.bin/nodemon ./server.js"]
EXPOSE 1112
