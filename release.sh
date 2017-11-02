#!/bin/bash
npm run build
cd dist
docker build -t webapp-backend .
docker tag webapp-backend:latest 288812438107.dkr.ecr.us-east-1.amazonaws.com/webapp-backend:latest
docker push 288812438107.dkr.ecr.us-east-1.amazonaws.com/webapp-backend:latest
