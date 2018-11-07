FROM node:alpine

MAINTAINER Shingo Hisakawa shingohisakawa@gmail.com

RUN wget --no-check-certificate -O - 'https://github.com/hisashin/NinjaPCR-web/archive/master.tar.gz' |tar zxvf - && \
 cd ./NinjaPCR-web-master && \
 npm install && \
 npx gulp && \
 npm install forever -g

ADD start.sh /

ENTRYPOINT /start.sh

