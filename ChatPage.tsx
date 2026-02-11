import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { sendMessageToServer, getMessages, isApiConfigured } from '../services/api';

export function ChatPage() {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const recipientId = state.activeChatUser;
  const recipientName = state.activeChatName || recipientId || '';
  const messages = recipientId ? (state.messages[recipientId] || []) : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  // Poll for new messages from server
  useEffect(() => {
    if (!recipientId || !isApiConfigured()) return;
    const poll = async () => {
      const serverMsgs = await getMessages(state.userId, recipientId);
      if (serverMsgs && serverMsgs.length > 0) {
        dispatch({ type: 'SET_MESSAGES', recipientId, messages: serverMsgs });
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [recipientId, state.userId, dispatch]);

  if (!recipientId) return null;

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      from: state.userId,
      to: recipientId,
      text: text.trim(),
      timestamp: Date.now(),
      type: 'text' as const,
    };
    dispatch({ type: 'ADD_MESSAGE', recipientId, message: msg });
    setText('');
    setShowEmoji(false);

    // Send to server
    await sendMessageToServer(state.userId, recipientId, text.trim());
  };

  const emojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '👋', '🔥', '❤️', '⭐', '🎮', '💀', '🚀', '💯', '🎵', '✨', '😤', '🥺', '😭', '🤩'];

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const bubbleStyle = state.settings.chatBubbleStyle === 'pill'
    ? 'rounded-full px-5'
    : state.settings.chatBubbleStyle === 'sharp'
    ? 'rounded-md'
    : 'rounded-2xl';

  const startCall = (type: 'voice' | 'video') => {
    dispatch({ type: 'START_CALL', peerId: recipientId, peerName: recipientName, callType: type, incoming: false });
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in min-h-0">
      {/* Chat Header */}
      <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button onClick={() => dispatch({ type: 'CLOSE_CHAT' })} className="text-slate-400 hover:text-white transition-colors text-lg">←</button>
        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-lg">💬</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{recipientName}</p>
          <p className="text-[10px] text-slate-400 font-mono">{recipientId}</p>
        </div>
        <button onClick={() => startCall('voice')} className="p-2 rounded-lg hover:bg-white/10 text-green-400">📞</button>
        <button onClick={() => startCall('video')} className="p-2 rounded-lg hover:bg-white/10 text-purple-400">📹</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.from === state.userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[75%] ${isMe
                ? `bg-blue-600/80 text-white ${bubbleStyle}`
                : `bg-slate-700/80 text-slate-100 ${bubbleStyle}`
              } px-3.5 py-2 shadow-lg`}>
                {msg.type === 'file' ? (
                  <div className="flex items-center gap-2">
                    <span>📎</span>
                    <span className="text-sm underline">{msg.fileName}</span>
                  </div>
                ) : (
                  <p className={`${state.settings.fontSize === 'small' ? 'text-xs' : state.settings.fontSize === 'large' ? 'text-base' : 'text-sm'}`}>
                    {msg.text}
                  </p>
                )}
                {state.settings.showTimestamps && (
                  <p className={`text-[9px] mt-1 ${isMe ? 'text-blue-200/60' : 'text-slate-500'} text-right`}>
                    {formatTime(msg.timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="glass mx-4 mb-1 rounded-xl p-2 grid grid-cols-10 gap-1 animate-slide-up">
          {emojis.map(e => (
            <button key={e} onClick={() => setText(t => t + e)} className="text-xl hover:scale-125 transition-transform p-1">{e}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass px-3 py-2 flex items-center gap-2 border-t border-white/5">
        <button onClick={() => setShowEmoji(v => !v)} className="p-2 rounded-lg hover:bg-white/10 text-xl">😊</button>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800/50 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-all text-sm font-bold"
        >➤</button>
      </div>
    </div>
  );
}
