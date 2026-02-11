import { useApp } from '../store';

export function IncomingCall() {
  const { state, dispatch } = useApp();
  const { callInfo } = state;

  if (!callInfo.active || !callInfo.incoming) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-3xl p-8 flex flex-col items-center gap-6 max-w-sm w-full mx-4 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-4xl border-4 border-green-500/50 animate-ring">
          📞
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{callInfo.peerName}</h2>
          <p className="text-sm text-slate-400 mt-1">
            Incoming {callInfo.type} call...
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => dispatch({ type: 'END_CALL' })}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-2xl shadow-lg shadow-red-600/30 transition-all hover:scale-110"
          >
            ✕
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'CALL_CONNECTED' });
            }}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center text-2xl shadow-lg shadow-green-600/30 transition-all hover:scale-110 animate-ring"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
