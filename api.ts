// ============================================
// Mason's Phone — API Service
// Connects to the Cloudflare Worker backend
// ============================================

// ⚠️ CHANGE THIS to your deployed Cloudflare Worker URL
// After deploying (see DEPLOYMENT_GUIDE.md), replace with:
// const API_URL = 'https://masons-phone-api.YOUR-SUBDOMAIN.workers.dev';
const API_URL = localStorage.getItem('masons-phone-api-url') || '';

export function setApiUrl(url: string) {
  localStorage.setItem('masons-phone-api-url', url);
  window.location.reload();
}

export function getApiUrl() {
  return API_URL;
}

export function isApiConfigured() {
  return API_URL.length > 0;
}

// --- Status ---
export async function updateStatus(userId: string, status: string) {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/api/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status }),
    });
  } catch { /* offline fallback */ }
}

export async function getStatus(userId: string) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/status?userId=${userId}`);
    return res.json();
  } catch { return null; }
}

// --- Messages ---
export async function sendMessageToServer(from: string, to: string, text: string, type = 'text') {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, text, type }),
    });
    return res.json();
  } catch { return null; }
}

export async function getMessages(user1: string, user2: string) {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/messages?user1=${user1}&user2=${user2}`);
    return res.json();
  } catch { return []; }
}

// --- Call Signaling ---
export async function sendSignal(from: string, to: string, signal: unknown) {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/api/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, signal }),
    });
  } catch { /* offline */ }
}

export async function pollSignal(userId: string) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/signal?userId=${userId}`);
    return res.json();
  } catch { return null; }
}

// --- Call Notifications ---
export async function sendCallNotification(from: string, to: string, type: string, action: string) {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/api/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, type, action }),
    });
  } catch { /* offline */ }
}

export async function pollCallNotification(userId: string) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/call?userId=${userId}`);
    return res.json();
  } catch { return null; }
}

// --- World Chat ---
export async function sendWorldMessage(from: string, text: string) {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/api/world`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, text }),
    });
    return res.json();
  } catch { return null; }
}

export async function getWorldMessages() {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/world`);
    return res.json();
  } catch { return []; }
}

// --- Files ---
export async function uploadFile(file: File, userId: string) {
  if (!API_URL) return null;
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    const res = await fetch(`${API_URL}/api/files`, { method: 'POST', body: formData });
    return res.json();
  } catch { return null; }
}

export async function getFiles() {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/files`);
    return res.json();
  } catch { return []; }
}

export function getFileDownloadUrl(fileId: string) {
  return `${API_URL}/api/files/${fileId}`;
}

// --- Users Directory ---
export async function registerUser(userId: string, username: string, avatar: string) {
  if (!API_URL) return;
  try {
    await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, avatar }),
    });
  } catch { /* offline */ }
}

export async function getUsers() {
  if (!API_URL) return [];
  try {
    const res = await fetch(`${API_URL}/api/users`);
    return res.json();
  } catch { return []; }
}
