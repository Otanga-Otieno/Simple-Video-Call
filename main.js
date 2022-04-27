const constraints = {
    audio: false,
    video: true,
};
const localVideoElement = document.querySelector("#localVideo");

async function playLocalVideo() {
    let localStream = await navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localVideoElement.srcObject = stream;
        return stream;
        //console.log('Got media stream ' + stream);
    })
    .catch(error => {
        console.error('Error accessing media devices ' + error);
    });
    return localStream;
}

//playLocalVideo();


const url = "ws://localhost:9005";
const signallingChannel = new WebSocket(url);

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

    if(data.icecandidate) {
        try {
            localPeerConnection.addIceCandidate(data.icecandidate);
        } catch (e) {
            console.error("Error adding received icecandidate ", e);
        }
    }

});


const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};
var localPeerConnection = new RTCPeerConnection(configuration);

localPeerConnection.addEventListener("icecandidate", event => {
    if(event.candidate) {
        signallingChannel.send(JSON.stringify(event.candidate));
    }
});

localPeerConnection.addEventListener("track", (event) => {
    console.log(event);
    const [remoteStream] = event.streams;
    localVideoElement = remoteStream;
})

async function makeCall() {

    let stream = await playLocalVideo();
    await stream.getTracks().forEach(track => {
        localPeerConnection.addTrack(track, stream);
    })

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