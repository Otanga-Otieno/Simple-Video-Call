var https = require('https');
var fs = require('fs');
var static = require('node-static');
const WebSocket = require('ws');


function isFile(path) {
    if(fs.existsSync(path)) return true;
    return false;
}

var options = {
    key: fs.readFileSync("/etc/letsencrypt/live/server.otanga.co.ke/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/server.otanga.co.ke/fullchain.pem")
};

var file = new static.Server();
var httpsServer = https.createServer(options, (req, res) => {
    if(req.url === "/") req.url = "/index.htm";
    let path = req.url.substring(1);
    if ( path !== "favicon.ico" && !isFile(path) ){
        req.url = "index.htm";
    }

    file.serve(req, res);
})

var httpsSocketServer = https.createServer(options, (req, res) => {
    //do nothing
});

const wsServer = new WebSocket.Server({server: httpsSocketServer});
httpsSocketServer.listen(9006);

wsServer.on('connection', (stream, req) => {
    stream.phrase = req.url.substring(1);

    stream.on('message', (message) => {
        wsServer.clients.forEach(client => {

            let phraseWord = stream.phrase;
            if(client.readyState == WebSocket.OPEN && client.phrase === phraseWord) {
                if(client !== stream) client.send(data.toString());
            }

        })
    });

    stream.on('close', () => {
        //close action
        console.log("closing");
    })

});

httpsServer.listen(9005);