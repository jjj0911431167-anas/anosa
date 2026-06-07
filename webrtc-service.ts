import { socketService } from "./socket-service";

interface PeerConnection {
  peerConnection: RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: MediaStream;
}

const peers = new Map<string, PeerConnection>();
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export const webrtcService = {
  async startCall(
    userId: string,
    recipientId: string,
    callType: "voice" | "video",
    onRemoteStream: (stream: MediaStream) => void,
  ) {
    try {
      // Get local media stream
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers,
      });

      // Add local stream tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote stream
      const remoteStream = new MediaStream();
      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        onRemoteStream(remoteStream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendICECandidate(recipientId, event.candidate);
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketService.sendOffer(recipientId, offer);

      // Store peer connection
      peers.set(recipientId, {
        peerConnection,
        localStream,
        remoteStream,
      });

      return { localStream, remoteStream };
    } catch (error) {
      console.error("[webrtc] Error starting call:", error);
      throw error;
    }
  },

  async answerCall(
    userId: string,
    callerId: string,
    callType: "voice" | "video",
    onRemoteStream: (stream: MediaStream) => void,
  ) {
    try {
      // Get local media stream
      const constraints = {
        audio: true,
        video: callType === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers,
      });

      // Add local stream tracks
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Handle remote stream
      const remoteStream = new MediaStream();
      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
        onRemoteStream(remoteStream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketService.sendICECandidate(callerId, event.candidate);
        }
      };

      // Store peer connection
      peers.set(callerId, {
        peerConnection,
        localStream,
        remoteStream,
      });

      return { localStream, remoteStream, peerConnection };
    } catch (error) {
      console.error("[webrtc] Error answering call:", error);
      throw error;
    }
  },

  async handleOffer(
    callerId: string,
    offer: RTCSessionDescriptionInit,
    peerConnection: RTCPeerConnection,
  ) {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketService.sendAnswer(callerId, answer);
    } catch (error) {
      console.error("[webrtc] Error handling offer:", error);
      throw error;
    }
  },

  async handleAnswer(
    peerId: string,
    answer: RTCSessionDescriptionInit,
  ) {
    try {
      const peer = peers.get(peerId);
      if (peer) {
        await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("[webrtc] Error handling answer:", error);
      throw error;
    }
  },

  async handleICECandidate(
    peerId: string,
    candidate: RTCIceCandidateInit,
  ) {
    try {
      const peer = peers.get(peerId);
      if (peer) {
        await peer.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("[webrtc] Error handling ICE candidate:", error);
    }
  },

  toggleAudio(peerId: string, enabled: boolean) {
    const peer = peers.get(peerId);
    if (peer) {
      peer.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  },

  toggleVideo(peerId: string, enabled: boolean) {
    const peer = peers.get(peerId);
    if (peer) {
      peer.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  },

  async switchCamera(peerId: string) {
    const peer = peers.get(peerId);
    if (peer) {
      const videoTrack = peer.localStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const facingMode = settings.facingMode === "user" ? "environment" : "user";
        const constraints = {
          audio: false,
          video: { facingMode },
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        const sender = peer.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
        
        // Stop old track
        videoTrack.stop();
        
        // Update local stream
        peer.localStream.removeTrack(videoTrack);
        peer.localStream.addTrack(newVideoTrack);
      }
    }
  },

  endCall(peerId: string) {
    const peer = peers.get(peerId);
    if (peer) {
      // Stop all tracks
      peer.localStream.getTracks().forEach((track) => track.stop());
      peer.remoteStream.getTracks().forEach((track) => track.stop());
      
      // Close peer connection
      peer.peerConnection.close();
      
      // Remove from peers map
      peers.delete(peerId);
    }
  },

  getPeerConnection(peerId: string) {
    return peers.get(peerId);
  },

  getAllPeers() {
    return Array.from(peers.entries());
  },

  cleanup() {
    peers.forEach((peer) => {
      peer.localStream.getTracks().forEach((track) => track.stop());
      peer.remoteStream.getTracks().forEach((track) => track.stop());
      peer.peerConnection.close();
    });
    peers.clear();
  },
};
