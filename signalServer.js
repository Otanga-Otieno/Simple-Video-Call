const WebSocket = require('ws');

const wsServer = WebSocket.Server({port: 9005});
wsServer.on('connection', (stream, req) => {

    //stream.id = req.headers['sec-websocket-key'];

    stream.on('message', (data) => {
        wsServer.clients.forEach(client => {
            if(client !== stream) client.send(data);
        })
    });

    stream.on('close', () => {
        //close action
    })

})