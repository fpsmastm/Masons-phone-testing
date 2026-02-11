import { useState } from 'react';
import { useApp } from '../store';

export function ContactsPage() {
  const { state, dispatch } = useApp();
  const [friendId, setFriendId] = useState('');
  const [friendName, setFriendName] = useState('');

  const startCall = (userId: string, name: string, type: 'voice' | 'video') => {
    dispatch({ type: 'START_CALL', peerId: userId, peerName: name, callType: type, incoming: false });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-white">👥 People</h1>

      {/* Connect to a friend */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Connect with a Friend</h2>
        <p className="text-xs text-slate-400">Enter your friend's User ID (they can copy it from their Home page)</p>
        <input
          type="text"
          value={friendId}
          onChange={e => setFriendId(e.target.value)}
          placeholder="Friend's User ID (e.g. mason-a1b2)"
          className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-mono"
        />
        <input
          type="text"
          value={friendName}
          onChange={e => setFriendName(e.target.value)}
          placeholder="Display name (e.g. Mason)"
          className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              if (friendId.trim() && friendName.trim()) {
                dispatch({ type: 'OPEN_CHAT', userId: friendId.trim(), userName: friendName.trim() });
              }
            }}
            disabled={!friendId.trim() || !friendName.trim()}
            className="py-2.5 rounded-xl bg-blue-600/20 text-blue-400 text-sm font-medium hover:bg-blue-600/30 disabled:opacity-30 transition-all flex items-center justify-center gap-1"
          >
            💬 Chat
          </button>
          <button
            onClick={() => {
              if (friendId.trim() && friendName.trim()) {
                startCall(friendId.trim(), friendName.trim(), 'voice');
              }
            }}
            disabled={!friendId.trim() || !friendName.trim()}
            className="py-2.5 rounded-xl bg-green-600/20 text-green-400 text-sm font-medium hover:bg-green-600/30 disabled:opacity-30 transition-all flex items-center justify-center gap-1"
          >
            📞 Call
          </button>
          <button
            onClick={() => {
              if (friendId.trim() && friendName.trim()) {
                startCall(friendId.trim(), friendName.trim(), 'video');
              }
            }}
            disabled={!friendId.trim() || !friendName.trim()}
            className="py-2.5 rounded-xl bg-purple-600/20 text-purple-400 text-sm font-medium hover:bg-purple-600/30 disabled:opacity-30 transition-all flex items-center justify-center gap-1"
          >
            📹 Video
          </button>
        </div>
      </div>

      {/* Online Users from Server */}
      {state.onlineUsers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Online Users</h2>
          {state.onlineUsers.filter(u => u.id !== state.userId).map(user => (
            <div key={user.id} className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-all">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                  {user.avatar}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400 font-mono">{user.id}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => dispatch({ type: 'OPEN_CHAT', userId: user.id, userName: user.name })}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-blue-400"
                  title="Message"
                >💬</button>
                <button
                  onClick={() => startCall(user.id, user.name, 'voice')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-green-400"
                  title="Voice Call"
                >📞</button>
                <button
                  onClick={() => startCall(user.id, user.name, 'video')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-purple-400"
                  title="Video Call"
                >📹</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent chats */}
      {Object.keys(state.messages).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Conversations</h2>
          {Object.entries(state.messages).map(([recipientId, msgs]) => {
            const lastMsg = msgs[msgs.length - 1];
            if (!lastMsg) return null;
            const name = recipientId; // We don't have a contact list — just use ID
            return (
              <button
                key={recipientId}
                onClick={() => dispatch({ type: 'OPEN_CHAT', userId: recipientId, userName: name })}
                className="w-full glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {lastMsg.from === state.userId ? 'You: ' : ''}{lastMsg.text}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
