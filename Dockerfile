FROM node:boron

# Create app directory
WORKDIR /usr/src/app

# copy source code
ADD . /usr/src/app

# Install app dependencies
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y python-pip python-dev build-essential virtualenv
RUN virtualenv myvirtualenv
RUN . myvirtualenv/bin/activate
# RUN pip install --upgrade pip
RUN pip install -e git+https://github.com/mycroftai/adapt#egg=adapt-parser --exists-action w
RUN npm install


EXPOSE 9091

CMD [ "node", "app.js" ]
