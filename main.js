const constraints = {
    audio: false,
    video: true,
};
const localVideoElement = document.querySelector("#localVideo");
const remoteVideoElement = document.querySelector("#remoteVideo");
var stream = getLocalStream();
var remoteStream = null;

async function playLocalVideo() {
    let localStream = await navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        //localVideoElement.srcObject = stream;
        return stream;
    })
    .catch(error => {
        console.error('Error accessing media devices ' + error);
    });
    return localStream;
}
async function afterLoad() {
    localVideoElement.srcObject = await stream;
}

async function getLocalStream() {
    let localStream = await playLocalVideo();
    return localStream;
}

function switchStream() {
    if(remoteStream == null) return;
    let currentStream = localVideoElement.srcObject;
    if (currentStream == stream) {
        localVideoElement.srcObject = remoteStream;
    }
    if (currentStream == remoteStream) {
        localVideoElement.srcObject = stream;
    } 
}


const url = "wss://server.otanga.co.ke:9006" + window.location.pathname;
const signallingChannel = new WebSocket(url);

signallingChannel.addEventListener("message", async (message) => {

    let data = JSON.parse(message.data);
    console.log(data);

    if(data.type === "offer") {

        const remoteDesc = new RTCSessionDescription(data);
        await offerReceived(remoteDesc);
        //let stream = await playLocalVideo();
        await stream.getTracks().forEach(track => {
            localPeerConnection.addTrack(track, stream);
        });
        const answer = await localPeerConnection.createAnswer();
        await offerCreated(answer);
        signallingChannel.send(JSON.stringify(answer));
    }

    if(data.type === "answer") {
        const remoteDesc = new RTCSessionDescription(data);
        await offerReceived(remoteDesc);
    }

    if(data.candidate) {
        try {
            localPeerConnection.addIceCandidate(data);
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

localPeerConnection.addEventListener("connectionstatechange", event => {
    if(localPeerConnection.connectionState === "connected") {
        console.log("Peers connected!");
    }
})

localPeerConnection.addEventListener("track", event => {
    console.log(event);
    remoteStream = event.streams;
    localVideoElement.srcObject = remoteStream;
})

async function makeCall() {

    //let stream = await playLocalVideo();
    await stream.getTracks().forEach(track => {
        localPeerConnection.addTrack(track, stream);
    })

    const offer = await localPeerConnection.createOffer();
    await offerCreated(offer);
    signallingChannel.send(JSON.stringify(offer));

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