import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { sendWorldMessage as sendWorldMsgApi, getWorldMessages, isApiConfigured } from '../services/api';

export function WorldPage() {
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.worldMessages.length]);

  // Poll world messages from server
  useEffect(() => {
    if (!isApiConfigured()) return;
    const poll = async () => {
      const msgs = await getWorldMessages();
      if (msgs && msgs.length > 0) {
        dispatch({ type: 'SET_WORLD_MESSAGES', messages: msgs });
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const sendMsg = async () => {
    if (!text.trim()) return;
    const msg = {
      id: crypto.randomUUID(),
      from: state.userId,
      to: 'world',
      text: text.trim(),
      timestamp: Date.now(),
      type: 'text' as const,
    };
    dispatch({ type: 'ADD_WORLD_MESSAGE', message: msg });
    setText('');
    await sendWorldMsgApi(state.userId, text.trim());
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex-1 flex flex-col animate-fade-in min-h-0">
      <div className="glass px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <span className="text-xl">🌍</span>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white">World Chat</h1>
          <p className="text-[10px] text-slate-400">
            {isApiConfigured() ? 'Everyone on this server can see messages' : 'Connect a server to chat globally'}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
        {state.worldMessages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-3xl mb-2">🌍</p>
            <p className="text-sm">No messages yet. Be the first!</p>
          </div>
        )}
        {state.worldMessages.map(msg => {
          const isMe = msg.from === state.userId;
          return (
            <div key={msg.id} className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm flex-shrink-0">
                {isMe ? state.avatar : '👤'}
              </div>
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className="text-[10px] text-slate-500 mb-0.5 px-1">{isMe ? state.username : msg.from}</span>
                <div className={`${isMe ? 'bg-blue-600/80' : 'bg-slate-700/80'} rounded-2xl px-3 py-1.5`}>
                  <p className="text-sm text-white">{msg.text}</p>
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass px-3 py-2 flex items-center gap-2 border-t border-white/5">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMsg()}
          placeholder="Send to everyone..."
          className="flex-1 bg-slate-800/50 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <button
          onClick={sendMsg}
          disabled={!text.trim()}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-all text-sm font-bold"
        >➤</button>
      </div>
    </div>
  );
}
