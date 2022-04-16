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

signallingChannel.onmessage = (message) => {
    //message from remote client
    data = JSON.parse(message.data);
    if(data.type === "offer") {
        console.log("Offer received");
        receiveCall();
    }
}


var localPeerConnection, remotePeerConnection;
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

async function makeCall() {

    const peerConnection = new RTCPeerConnection(configuration);

    signallingChannel.onmessage = async (message) => {
        if(message.answer) {
            const remoteDesc = new RTCSessionDescription(message.answer);
            await peerConnection.setRemoteDescription(remoteDesc);
        }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    signallingChannel.send(JSON.stringify(offer));

}

async function receiveCall() {

    const peerConnection = new RTCPeerConnection(configuration);
    signallingChannel.onmessage = async (message) => {
        if(message.offer) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            signallingChannel.send({'answer': answer});
        }
    }

}