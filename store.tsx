import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';

// ============================================
// Types
// ============================================

export interface AppSettings {
  background: string;
  rainEnabled: boolean;
  rainIntensity: number;
  notificationSound: boolean;
  fontSize: 'small' | 'medium' | 'large';
  chatBubbleStyle: 'rounded' | 'sharp' | 'pill';
  showTimestamps: boolean;
  compactMode: boolean;
}

export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
  fileName?: string;
}

export interface CallInfo {
  active: boolean;
  type: 'voice' | 'video' | null;
  peerId: string | null;
  peerName: string | null;
  incoming: boolean;
  connected: boolean;
  duration: number;
  muted: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
}

export type Page = 'home' | 'contacts' | 'chat' | 'call' | 'settings' | 'files' | 'world' | 'setup';

export interface AppState {
  userId: string;
  username: string;
  avatar: string;
  page: Page;
  activeChatUser: string | null;
  activeChatName: string | null;
  messages: Record<string, ChatMessage[]>; // keyed by recipientId
  worldMessages: ChatMessage[];
  callInfo: CallInfo;
  settings: AppSettings;
  onlineUsers: { id: string; name: string; avatar: string }[];
  notificationPermission: string;
  setupDone: boolean;
}

// ============================================
// Actions
// ============================================

export type Action =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'SET_USER'; userId: string; username: string; avatar: string }
  | { type: 'OPEN_CHAT'; userId: string; userName: string }
  | { type: 'CLOSE_CHAT' }
  | { type: 'ADD_MESSAGE'; recipientId: string; message: ChatMessage }
  | { type: 'ADD_WORLD_MESSAGE'; message: ChatMessage }
  | { type: 'SET_WORLD_MESSAGES'; messages: ChatMessage[] }
  | { type: 'START_CALL'; peerId: string; peerName: string; callType: 'voice' | 'video'; incoming: boolean }
  | { type: 'CALL_CONNECTED' }
  | { type: 'END_CALL' }
  | { type: 'TOGGLE_MUTE'; muted: boolean }
  | { type: 'TOGGLE_VIDEO'; videoOff: boolean }
  | { type: 'TOGGLE_SCREEN_SHARE'; sharing: boolean }
  | { type: 'SET_CALL_DURATION'; duration: number }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'SET_ONLINE_USERS'; users: { id: string; name: string; avatar: string }[] }
  | { type: 'SET_NOTIFICATION_PERMISSION'; permission: string }
  | { type: 'SET_SETUP_DONE' }
  | { type: 'SET_MESSAGES'; recipientId: string; messages: ChatMessage[] };

// ============================================
// Initial State
// ============================================

function loadState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem('masons-phone-state');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

const saved = loadState();

const defaultSettings: AppSettings = {
  background: 'default',
  rainEnabled: true,
  rainIntensity: 50,
  notificationSound: true,
  fontSize: 'medium',
  chatBubbleStyle: 'rounded',
  showTimestamps: true,
  compactMode: false,
};

const defaultCallInfo: CallInfo = {
  active: false,
  type: null,
  peerId: null,
  peerName: null,
  incoming: false,
  connected: false,
  duration: 0,
  muted: false,
  videoEnabled: true,
  screenSharing: false,
};

const initialState: AppState = {
  userId: saved.userId || '',
  username: saved.username || '',
  avatar: saved.avatar || '😎',
  page: saved.setupDone ? 'home' : 'setup',
  activeChatUser: null,
  activeChatName: null,
  messages: saved.messages || {},
  worldMessages: [],
  callInfo: defaultCallInfo,
  settings: { ...defaultSettings, ...saved.settings },
  onlineUsers: [],
  notificationPermission: 'default',
  setupDone: saved.setupDone || false,
};

// ============================================
// Reducer
// ============================================

function reducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'SET_PAGE':
      newState = { ...state, page: action.page };
      break;
    case 'SET_USER':
      newState = { ...state, userId: action.userId, username: action.username, avatar: action.avatar };
      break;
    case 'OPEN_CHAT':
      newState = { ...state, activeChatUser: action.userId, activeChatName: action.userName, page: 'chat' };
      break;
    case 'CLOSE_CHAT':
      newState = { ...state, activeChatUser: null, activeChatName: null, page: 'contacts' };
      break;
    case 'ADD_MESSAGE': {
      const prev = state.messages[action.recipientId] || [];
      newState = {
        ...state,
        messages: { ...state.messages, [action.recipientId]: [...prev, action.message] },
      };
      break;
    }
    case 'SET_MESSAGES': {
      newState = {
        ...state,
        messages: { ...state.messages, [action.recipientId]: action.messages },
      };
      break;
    }
    case 'ADD_WORLD_MESSAGE':
      newState = { ...state, worldMessages: [...state.worldMessages, action.message] };
      break;
    case 'SET_WORLD_MESSAGES':
      newState = { ...state, worldMessages: action.messages };
      break;
    case 'START_CALL':
      newState = {
        ...state,
        callInfo: {
          ...defaultCallInfo,
          active: true,
          type: action.callType,
          peerId: action.peerId,
          peerName: action.peerName,
          incoming: action.incoming,
          videoEnabled: action.callType === 'video',
        },
        page: action.incoming ? state.page : 'call',
      };
      break;
    case 'CALL_CONNECTED':
      newState = { ...state, callInfo: { ...state.callInfo, connected: true, incoming: false }, page: 'call' };
      break;
    case 'END_CALL':
      newState = { ...state, callInfo: defaultCallInfo };
      break;
    case 'TOGGLE_MUTE':
      newState = { ...state, callInfo: { ...state.callInfo, muted: action.muted } };
      break;
    case 'TOGGLE_VIDEO':
      newState = { ...state, callInfo: { ...state.callInfo, videoEnabled: !action.videoOff } };
      break;
    case 'TOGGLE_SCREEN_SHARE':
      newState = { ...state, callInfo: { ...state.callInfo, screenSharing: action.sharing } };
      break;
    case 'SET_CALL_DURATION':
      newState = { ...state, callInfo: { ...state.callInfo, duration: action.duration } };
      break;
    case 'UPDATE_SETTINGS':
      newState = { ...state, settings: { ...state.settings, ...action.settings } };
      break;
    case 'SET_ONLINE_USERS':
      newState = { ...state, onlineUsers: action.users };
      break;
    case 'SET_NOTIFICATION_PERMISSION':
      newState = { ...state, notificationPermission: action.permission };
      break;
    case 'SET_SETUP_DONE':
      newState = { ...state, setupDone: true, page: 'home' };
      break;
    default:
      return state;
  }

  // Persist to localStorage
  try {
    localStorage.setItem('masons-phone-state', JSON.stringify({
      userId: newState.userId,
      username: newState.username,
      avatar: newState.avatar,
      messages: newState.messages,
      settings: newState.settings,
      setupDone: newState.setupDone,
    }));
  } catch { /* quota exceeded */ }

  return newState;
}

// ============================================
// Context
// ============================================

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
