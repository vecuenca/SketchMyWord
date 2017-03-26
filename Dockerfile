# base image
FROM node

# create the application directory
RUN mkdir -p /home/nodejs/app
# copy the application
COPY . /home/nodejs/app
# move to working directory
WORKDIR /home/nodejs/app
# install all npm modules
RUN npm install --production
WORKDIR /home/nodejs/app/app/

EXPOSE 3000
# run the nodejs application
CMD NODE_ENV=production node app.js