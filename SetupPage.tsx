import { useState } from 'react';
import { useApp } from '../store';
import { requestNotificationPermission, getNotificationPermission } from '../services/notifications';
import { setApiUrl, getApiUrl } from '../services/api';

const avatars = ['😎', '🧑‍💻', '🎮', '🎵', '📱', '🎨', '⚡', '🌙', '🔥', '🦊', '🐱', '🤖', '👾', '🎯', '🌊', '💎'];

export function SetupPage() {
  const { dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('😎');
  const [apiUrl, setApiUrlLocal] = useState(getApiUrl());
  const [permStatus, setPermStatus] = useState(getNotificationPermission());
  const [micGranted, setMicGranted] = useState(false);

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(t => t.stop());
      setMicGranted(true);
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setMicGranted(true);
      } catch {
        alert('Mic/Camera permission denied. You need HTTPS — deploy to GitHub Pages or Cloudflare Pages first. See the guide in Settings.');
      }
    }
  };

  const requestNotifs = async () => {
    const granted = await requestNotificationPermission();
    setPermStatus(granted ? 'granted' : 'denied');
    if (granted) {
      dispatch({ type: 'SET_NOTIFICATION_PERMISSION', permission: 'granted' });
    }
  };

  const finish = () => {
    const userId = username.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.random().toString(36).slice(2, 6);
    dispatch({ type: 'SET_USER', userId, username, avatar });
    dispatch({ type: 'SET_SETUP_DONE' });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="glass rounded-3xl p-6 max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-1">📱 Mason's Phone</h1>
          <p className="text-slate-400 text-sm">Real calls, real messages, real video</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`w-3 h-3 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-slate-700'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-white text-center">Choose your name</h2>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your display name..."
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-lg"
              autoFocus
            />
            <h3 className="text-sm text-slate-400 text-center">Choose your avatar</h3>
            <div className="grid grid-cols-8 gap-2">
              {avatars.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-2 rounded-xl transition-all hover:scale-110 ${
                    avatar === a ? 'bg-blue-600/30 ring-2 ring-blue-500 scale-110' : 'hover:bg-white/5'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button
              onClick={() => username.trim() && setStep(2)}
              disabled={!username.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold transition-all"
            >
              Next →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-white text-center">🎤 Mic & Camera</h2>
            <p className="text-sm text-slate-400 text-center">
              For real voice/video calls, allow mic & camera access.
            </p>
            <p className="text-xs text-yellow-400/80 text-center">
              ⚠️ This only works on HTTPS websites. If you're on file://, deploy first!
            </p>
            <button
              onClick={requestMic}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                micGranted
                  ? 'bg-green-600/30 text-green-400 ring-1 ring-green-500'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {micGranted ? '✅ Mic & Camera Granted!' : '🎤 Allow Mic & Camera'}
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
            >
              {micGranted ? 'Next →' : 'Skip for now →'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-white text-center">🔔 Notifications</h2>
            <p className="text-sm text-slate-400 text-center">
              Get notified when someone calls or messages you (even when the tab is in the background).
            </p>
            <button
              onClick={requestNotifs}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                permStatus === 'granted'
                  ? 'bg-green-600/30 text-green-400 ring-1 ring-green-500'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {permStatus === 'granted' ? '✅ Notifications Enabled!' : '🔔 Allow Notifications'}
            </button>
            <button
              onClick={() => setStep(4)}
              className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all"
            >
              {permStatus === 'granted' ? 'Next →' : 'Skip for now →'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-lg font-semibold text-white text-center">🌐 Backend Server</h2>
            <p className="text-sm text-slate-400 text-center">
              Paste your Cloudflare Worker URL to enable real messaging, calls with friends, and file sharing across devices.
            </p>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrlLocal(e.target.value)}
              placeholder="https://masons-phone-api.workers.dev"
              className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono"
            />
            <p className="text-xs text-slate-500 text-center">
              No server? That's OK — the app works locally for demo. See the deployment guide in Settings.
            </p>
            {apiUrl && (
              <button
                onClick={() => { setApiUrl(apiUrl); }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
              >
                Save & Connect
              </button>
            )}
            <button
              onClick={finish}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all text-lg"
            >
              🚀 Start Using Mason's Phone!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
