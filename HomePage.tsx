import { useApp } from '../store';
import { isApiConfigured } from '../services/api';

export function HomePage() {
  const { state, dispatch } = useApp();
  const onlineCount = state.onlineUsers.length;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">📱 Mason's Phone</h1>
          <p className="text-slate-400 text-sm mt-1">
            {onlineCount > 0 ? `${onlineCount} users online` : 'Ready to connect'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl border-2 border-blue-400/30">
          {state.avatar}
        </div>
      </div>

      {/* Connection Status */}
      <div className={`glass rounded-2xl p-4 ${isApiConfigured() ? 'border-green-500/20' : 'border-yellow-500/20'} border`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isApiConfigured() ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          <div>
            <p className="text-sm font-medium text-white">
              {isApiConfigured() ? '🟢 Connected to Server' : '🟡 Local Mode (No Server)'}
            </p>
            <p className="text-xs text-slate-400">
              {isApiConfigured()
                ? 'Real-time messaging and calls active'
                : 'Set up a Cloudflare Worker to call friends. Go to Settings → Server Setup'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'contacts' })}
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all hover:scale-105"
        >
          <span className="text-2xl">📞</span>
          <span className="text-xs text-slate-300 font-medium">Call</span>
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'world' })}
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all hover:scale-105"
        >
          <span className="text-2xl">🌍</span>
          <span className="text-xs text-slate-300 font-medium">World Chat</span>
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'files' })}
          className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all hover:scale-105"
        >
          <span className="text-2xl">📁</span>
          <span className="text-xs text-slate-300 font-medium">Files</span>
        </button>
      </div>

      {/* Your ID Card */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Your ID</h2>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl border-2 border-blue-400/30">
            {state.avatar}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">{state.username || 'Not set'}</p>
            <p className="text-xs text-slate-400 font-mono">{state.userId}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Share your ID with friends so they can call you!</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(state.userId);
            alert('User ID copied to clipboard! Share it with your friend.');
          }}
          className="w-full py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-medium hover:bg-blue-600/30 transition-all"
        >
          📋 Copy My User ID
        </button>
      </div>

      {/* Online Users */}
      {state.onlineUsers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Online Now</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {state.onlineUsers.map(user => (
              <button
                key={user.id}
                onClick={() => dispatch({ type: 'OPEN_CHAT', userId: user.id, userName: user.name })}
                className="flex flex-col items-center gap-1.5 min-w-[60px] hover:scale-110 transition-transform"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl border-2 border-green-500/50">
                    {user.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">📖 How to Call Friends</h2>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex gap-2 items-start">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Deploy this app to <strong>GitHub Pages</strong> or <strong>Cloudflare Pages</strong> for HTTPS (required for mic/camera)</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Deploy the <strong>Cloudflare Worker</strong> backend (see Settings for full code)</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Both you and your friend open the website and enter the Worker URL</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Go to <strong>People tab</strong>, enter your friend's User ID, and <strong>call or message them!</strong></span>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
