import { useEffect } from 'react';
import { AppProvider, useApp } from './store';
import RainEffect from "./RainEffect";
import { BottomNav } from './components/BottomNav';
import { SetupPage } from './components/SetupPage';
import { HomePage } from './components/HomePage';
import { ContactsPage } from './components/ContactsPage';
import { ChatPage } from './components/ChatPage';
import { CallPage } from './components/CallPage';
import { SettingsPage } from './components/SettingsPage';
import { FilesPage } from './components/FilesPage';
import { WorldPage } from './components/WorldPage';
import { IncomingCall } from './components/IncomingCall';
import { pollCallNotification, updateStatus, registerUser, getUsers, isApiConfigured } from './services/api';
import { sendNotification } from './services/notifications';

const backgrounds: Record<string, string> = {
  default: 'from-slate-950 via-slate-900 to-slate-950',
  midnight: 'from-blue-950 via-slate-900 to-indigo-950',
  aurora: 'from-emerald-950 via-slate-900 to-purple-950',
  crimson: 'from-red-950 via-slate-900 to-rose-950',
  ocean: 'from-cyan-950 via-slate-950 to-blue-950',
  void: 'from-black via-slate-950 to-black',
  sunset: 'from-orange-950 via-slate-900 to-purple-950',
  forest: 'from-green-950 via-slate-950 to-emerald-950',
};

function AppContent() {
  const { state, dispatch } = useApp();
  const bg = backgrounds[state.settings.background] || backgrounds.default;

  // Register with server & keep alive
  useEffect(() => {
    if (!state.setupDone || !isApiConfigured()) return;

    const register = () => {
      updateStatus(state.userId, 'online');
      registerUser(state.userId, state.username, state.avatar);
    };

    register();
    const interval = setInterval(register, 30000); // heartbeat every 30s
    return () => clearInterval(interval);
  }, [state.setupDone, state.userId, state.username, state.avatar]);

  // Poll for online users
  useEffect(() => {
    if (!state.setupDone || !isApiConfigured()) return;

    const poll = async () => {
      const users = await getUsers();
      if (users && Array.isArray(users)) {
        dispatch({
          type: 'SET_ONLINE_USERS',
          users: users.filter((u: { userId: string; username: string; avatar: string }) => u.userId !== state.userId).map((u: { userId: string; username: string; avatar: string }) => ({
            id: u.userId,
            name: u.username,
            avatar: u.avatar,
          })),
        });
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [state.setupDone, state.userId, dispatch]);

  // Poll for incoming calls
  useEffect(() => {
    if (!state.setupDone || !isApiConfigured()) return;

    const poll = async () => {
      const call = await pollCallNotification(state.userId);
      if (call && call.action === 'ring' && !state.callInfo.active) {
        dispatch({
          type: 'START_CALL',
          peerId: call.from,
          peerName: call.from,
          callType: call.type || 'voice',
          incoming: true,
        });
        sendNotification('📞 Incoming Call!', `${call.from} is calling you`);
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [state.setupDone, state.userId, state.callInfo.active, dispatch]);

  const renderPage = () => {
    switch (state.page) {
      case 'setup': return <SetupPage />;
      case 'home': return <HomePage />;
      case 'contacts': return <ContactsPage />;
      case 'chat': return <ChatPage />;
      case 'call': return <CallPage />;
      case 'settings': return <SettingsPage />;
      case 'files': return <FilesPage />;
      case 'world': return <WorldPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col bg-gradient-to-br ${bg} text-white overflow-hidden relative`}>
      <RainEffect />
      <IncomingCall />

      {/* Status bar */}
      {state.page !== 'setup' && (
        <div className="flex items-center justify-between px-4 py-1.5 text-[10px] text-slate-500 z-40 bg-black/20">
          <div className="flex items-center gap-2">
            <span>📱 Mason's Phone</span>
            {state.callInfo.active && state.callInfo.connected && (
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                In Call
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isApiConfigured() && <span className="text-green-400">●</span>}
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        {renderPage()}
      </main>

      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
