var https = require('https');
var fs = require('fs');
var static = require('node-static');
const WebSocket = require('ws');

var options = {
    key: fs.readFileSync("/etc/letsencrypt/live/server.otanga.co.ke/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/server.otanga.co.ke/fullchain.pem")
};

var file = new static.Server();
var httpsServer = https.createServer(options, (req, res) => {
    if(req.url === "/") req.url = "index.htm";
    file.serve(req, res);
})

const wsServer = WebSocket.Server({server: httpsServer});
wsServer.on('connection', (stream, req) => {
    stream.phrase = req.url;

    stream.on('message', (data) => {
        wsServer.clients.forEach(client => {
            let phraseWord = stream.phrase;
            if(client.readyState == WebSocket.OPEN && client.phrase === phraseWord) {
                if(client !== stream) client.send(data);
            }
        })
    });

    stream.on('close', () => {
        //close action
    })

})

httpsServer.listen(9005);