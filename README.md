# Source of [http://ninjapcr.tori.st](http://ninjapcr.tori.st)

NinjaPCR needs WiFi, but that doesn't mean it have to be connected to internet.

You can run server localy without [our online console](http://ninjapcr.tori.st/console/) for private network.

## Run by Docker

1. Install [Docker](https://www.docker.com/)
2. Run

Raspberry Pi
```
docker run --restart=always -it --name ninjapcr -d -p 3000:3000 hisashin/ninjapcr-rpi
```
Others
```
docker run --restart=always -it --name ninjapcr -d -p 3000:3000 hisashin/ninjapcr
```

## Run by Manual

1. Clone or download this project to your pc by hitting "Clone or download" button on top-right of [github page](https://github.com/hisashin/NinjaPCR-web).
2. Install [Node.js](https://nodejs.org/en/download/) if not yet installed.
3. Open terminal and change directory to the one you copied at step1.
4. Run
```
npm install
npx gulp
node app.js
```

Either way, access [http://localhost:3000/console](http://localhost:3000/console). 

Any devices in same network can use that console at http://(ip of your pc):3000/console if port 3000 is open.
