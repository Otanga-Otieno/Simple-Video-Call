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

var localPeerConnection;

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

signallingChannel.addEventListener("message", async (message) => {
    let data = JSON.parse(message.data);

    if(data.type === "offer") {
        localPeerConnection = new RTCPeerConnection(configuration);
        const remoteDesc = new RTCSessionDescription(data);
        await offerReceived(remoteDesc);
        const answer = await localPeerConnection.createAnswer();
        await offerCreated(answer);
        signallingChannel.send(JSON.stringify(answer));
    }

    if(data.type === "answer") {
        const remoteDesc = new RTCSessionDescription(data);
        await offerReceived(remoteDesc);
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
    await offerCreated(offer);
    signallingChannel.send(JSON.stringify(offer));

}

async function receiveCall() {
    //
}

async function offerCreated(description) {
    localPeerConnection.setLocalDescription(description);
}

async function offerReceived(description) {
    localPeerConnection.setRemoteDescription(description);
}

function logPeerConnections() {
    console.log(localPeerConnection);
}