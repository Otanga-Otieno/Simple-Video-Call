const WebSocket = require('ws');

const wsServer = WebSocket.Server();
wsServer.listen(9005);
wsServer.on('connection', (stream, req) => {

    stream.on('message', (data) => {
        //console.log(data + "\n");
        wsServer.clients.forEach(client => {
            if(client !== stream) client.send(data);
        })
    });

    stream.on('close', () => {
        //close action
    })

})