/**
 * MindBloom Free Native WebRTC Video Manager
 * Uses browser-native RTCPeerConnection and public Google STUN servers.
 * Completely free, open-source, and does not require paid 3rd party providers.
 */

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export const FREE_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export class MindBloomWebRTC {
  peerConnection: RTCPeerConnection | null = null;
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;

  constructor() {
    this.remoteStream = new MediaStream();
  }

  async initializeLocalStream(videoElement?: HTMLVideoElement): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoElement) {
        videoElement.srcObject = this.localStream;
      }

      return this.localStream;
    } catch (err) {
      console.warn('Camera access fallback (simulated local media stream)', err);
      // Fallback canvas stream if camera permission denied in headless environment
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#2D6A4F';
        ctx.fillRect(0, 0, 640, 480);
      }
      const stream = (canvas as any).captureStream(30);
      this.localStream = stream;
      if (videoElement) videoElement.srcObject = stream;
      return stream;
    }
  }

  createPeerConnection(
    onRemoteTrack?: (stream: MediaStream) => void,
    onIceCandidate?: (candidate: RTCIceCandidate) => void
  ): RTCPeerConnection {
    this.peerConnection = new RTCPeerConnection({
      iceServers: FREE_STUN_SERVERS,
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      if (onRemoteTrack && this.remoteStream) {
        onRemoteTrack(this.remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    return this.peerConnection;
  }

  toggleAudio(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });
    return audioTracks[0]?.enabled ?? false;
  }

  toggleVideo(enabled?: boolean): boolean {
    if (!this.localStream) return false;
    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });
    return videoTracks[0]?.enabled ?? false;
  }

  closeSession() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
