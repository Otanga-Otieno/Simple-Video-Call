const constraints = {
    audio: false,
    video: true,
};
const localVideoElement = document.querySelector("#localVideo");

function playLocalVideo() {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localVideoElement.srcObject = stream;
        console.log('Got media stream ' + stream);
    })
    .catch(error => {
        console.error('Error accessing media devices ' + error);
    })
}

//playLocalVideo();


const url = "ws://localhost:9005";
const signallingChannel = new WebSocket(url);

var localPeerConnection, remotePeerConnection;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

signallingChannel.addEventListener("message", (message) => {
    //message from remote client
    data = JSON.parse(message.data);
    if(data.type === "offer") {
        console.log("Offer received");
        //receiveCall();
    }
});

signallingChannel.addEventListener("message", async (message) => {
    let data = JSON.parse(message.data);

    if(data.type === "offer") {
        localPeerConnection, remotePeerConnection = new RTCPeerConnection(configuration);
        localPeerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await localPeerConnection.createAnswer();
        console.log("Answer created");
        await localPeerConnection.setLocalDescription(answer);
        await remotePeerConnection.setRemoteDescription(answer);
        console.log(answer);
        signallingChannel.send(JSON.stringify(answer));
    }

    if(data.type === "answer") {
        const remoteDesc = new RTCSessionDescription(data);
        await answerCreated(remoteDesc);
        console.log("Answer received and set");

    }

});

async function makeCall() {

    localPeerConnection = new RTCPeerConnection(configuration);
    localPeerConnection.addEventListener("icecandidate", event => {
        console.log(event);
        if(event.candidate) {
            signallingChannel.send(event.candidate);
        }
    });

    const offer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(offer);
    signallingChannel.send(JSON.stringify(offer));

}

async function receiveCall() {
    //
}

async function offerCreated() {
    
}

async function answerCreated(description) {
    remotePeerConnection = new RTCPeerConnection(configuration);
    remotePeerConnection.setLocalDescription(description);
    localPeerConnection.setRemoteDescription(description);
}

function logPeerConnections() {
    console.log(localPeerConnection);
    console.log(remotePeerConnection);
}