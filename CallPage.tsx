import { useEffect, useRef, useCallback } from 'react';
import { useApp } from '../store';
import { WebRTCService } from '../services/webrtc';
import { sendSignal, pollSignal, sendCallNotification, isApiConfigured } from '../services/api';

export function CallPage() {
  const { state, dispatch } = useApp();
  const { callInfo } = state;
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Initialize WebRTC call
  const initCall = useCallback(async () => {
    if (!callInfo.active || !callInfo.peerId) return;

    const webrtc = new WebRTCService({
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        dispatch({ type: 'CALL_CONNECTED' });
      },
      onIceCandidate: async (candidate) => {
        if (callInfo.peerId) {
          await sendSignal(state.userId, callInfo.peerId, { type: 'ice-candidate', candidate });
        }
      },
      onConnectionStateChange: (connState) => {
        if (connState === 'disconnected' || connState === 'failed' || connState === 'closed') {
          endCall();
        }
      },
    });

    webrtcRef.current = webrtc;

    try {
      // Get local media
      const localStream = await webrtc.getLocalStream(callInfo.type === 'video');
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      webrtc.createPeerConnection();

      if (!callInfo.incoming) {
        // We are the caller — create offer
        await sendCallNotification(state.userId, callInfo.peerId!, callInfo.type || 'voice', 'ring');
        const offer = await webrtc.createOffer();
        await sendSignal(state.userId, callInfo.peerId!, { type: 'offer', offer });
      }

      // Poll for signals from the other peer
      pollingRef.current = setInterval(async () => {
        if (!callInfo.peerId) return;
        const signal = await pollSignal(state.userId);
        if (!signal) return;

        const data = signal.signal;
        if (data.type === 'offer') {
          const answer = await webrtc.handleOffer(data.offer);
          await sendSignal(state.userId, signal.from, { type: 'answer', answer });
        } else if (data.type === 'answer') {
          await webrtc.handleAnswer(data.answer);
        } else if (data.type === 'ice-candidate') {
          await webrtc.addIceCandidate(data.candidate);
        } else if (data.type === 'hangup') {
          endCall();
        }
      }, 1000);

    } catch (err) {
      console.error('Call setup failed:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callInfo.active, callInfo.peerId, callInfo.type, callInfo.incoming, state.userId]);

  useEffect(() => {
    if (callInfo.active && !callInfo.incoming && isApiConfigured()) {
      initCall();
    }
    return () => {
      clearInterval(pollingRef.current);
    };
  }, [callInfo.active, callInfo.incoming, initCall]);

  // Call timer
  useEffect(() => {
    if (callInfo.active && callInfo.connected) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_CALL_DURATION', duration: callInfo.duration + 1 });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callInfo.active, callInfo.connected, callInfo.duration, dispatch]);

  const endCall = () => {
    if (webrtcRef.current) {
      webrtcRef.current.hangup();
      webrtcRef.current = null;
    }
    clearInterval(pollingRef.current);
    clearInterval(timerRef.current);
    if (callInfo.peerId) {
      sendSignal(state.userId, callInfo.peerId, { type: 'hangup' });
    }
    dispatch({ type: 'END_CALL' });
    dispatch({ type: 'SET_PAGE', page: 'home' });
  };

  const toggleMute = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleMute();
      dispatch({ type: 'TOGGLE_MUTE', muted });
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const off = webrtcRef.current.toggleVideo();
      dispatch({ type: 'TOGGLE_VIDEO', videoOff: off });
    }
  };

  const toggleScreenShare = async () => {
    if (!webrtcRef.current) return;
    if (callInfo.screenSharing) {
      await webrtcRef.current.stopScreenShare();
      dispatch({ type: 'TOGGLE_SCREEN_SHARE', sharing: false });
    } else {
      const stream = await webrtcRef.current.startScreenShare();
      if (stream) dispatch({ type: 'TOGGLE_SCREEN_SHARE', sharing: true });
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!callInfo.active) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 animate-fade-in">
        <p className="text-3xl mb-2">📞</p>
        <p className="text-sm">No active call</p>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'contacts' })} className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">
          Go to People
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
      {/* Remote Video */}
      {callInfo.type === 'video' && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-slate-900"
        />
      )}

      {/* Overlay */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={`w-24 h-24 rounded-full bg-slate-700/80 flex items-center justify-center text-5xl border-4 ${
          callInfo.connected ? 'border-green-500/50 animate-pulse-glow' : 'border-blue-500/50 animate-ring'
        }`}>
          📞
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{callInfo.peerName}</h2>
          <p className="text-sm text-slate-300 mt-1">
            {callInfo.connected
              ? formatDuration(callInfo.duration)
              : 'Connecting...'
            }
          </p>
          <p className="text-xs text-blue-400 mt-1">
            {callInfo.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
            {callInfo.screenSharing && ' • 🖥 Screen Sharing'}
          </p>
          {!isApiConfigured() && (
            <p className="text-xs text-yellow-400 mt-2">⚠️ No server configured — connect a Cloudflare Worker to make real calls</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full ${callInfo.muted ? 'bg-red-600/80' : 'bg-slate-700/80'} hover:bg-slate-600/80 flex items-center justify-center text-lg transition-all hover:scale-110`}
          >
            {callInfo.muted ? '🔇' : '🎤'}
          </button>

          {callInfo.type === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full ${!callInfo.videoEnabled ? 'bg-red-600/80' : 'bg-slate-700/80'} hover:bg-slate-600/80 flex items-center justify-center text-lg transition-all hover:scale-110`}
            >
              {callInfo.videoEnabled ? '📹' : '🚫'}
            </button>
          )}

          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full ${callInfo.screenSharing ? 'bg-blue-600/80' : 'bg-slate-700/80'} hover:bg-slate-600/80 flex items-center justify-center text-lg transition-all hover:scale-110`}
          >
            🖥
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 transition-all hover:scale-110"
          >
            📵
          </button>
        </div>
      </div>

      {/* Local Video (self-view) */}
      {callInfo.type === 'video' && callInfo.videoEnabled && (
        <div className="absolute top-4 right-4 w-28 h-36 bg-slate-800/80 rounded-xl border border-blue-500/30 overflow-hidden z-20">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-1 left-1 text-[8px] text-green-400 font-mono bg-black/50 px-1 rounded">YOU</div>
        </div>
      )}
    </div>
  );
}
