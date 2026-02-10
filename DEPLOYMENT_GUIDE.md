# 🚀 Mason's Phone — Complete Deployment Guide

## What This App Does (FOR REAL)
- **Real video/voice calls** between Chromebooks using WebRTC (peer-to-peer)
- **Real messaging** synced through a Cloudflare Worker backend
- **Real notifications** when someone calls you
- **Real mic & camera** access via browser APIs
- **World chat** for global messaging
- **File sharing** through the backend

## ⚠️ Why You MUST Deploy (Not Just Open the HTML)
Browsers **block** mic, camera, and notifications on:
- `file://` URLs (double-clicking the HTML file)
- `http://` sites

You **need HTTPS** which is free from GitHub Pages or Cloudflare Pages.

---

## Step 1: Deploy the Frontend (Choose One)

### Option A: GitHub Pages (Easiest)
1. Go to https://github.com → Sign up or login
2. Click **New Repository** → name it `masons-phone` → make it **Public**
3. Run `npm run build` on your computer
4. Upload everything inside the `dist/` folder to the repo root
5. Go to **Settings → Pages → Source: Deploy from branch → main → / (root) → Save**
6. Your site is live at `https://YOUR-USERNAME.github.io/masons-phone/`

### Option B: Cloudflare Pages (Faster)
1. Go to https://dash.cloudflare.com → Sign up
2. Go to **Workers & Pages → Create → Pages → Direct Upload**
3. Upload the `dist/` folder
4. Your site is at `https://masons-phone.pages.dev`

---

## Step 2: Deploy the Backend (Cloudflare Worker + KV)

This is what lets you ACTUALLY message and call other people.

### 2a. Install Wrangler
```bash
npm install -g wrangler
wrangler login
```

### 2b. Create worker project
```bash
mkdir masons-phone-api
cd masons-phone-api
```

### 2c. Create `worker.js`
```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS')
      return new Response(null, { headers: cors });

    try {
      // --- MESSAGES ---
      if (path === '/api/messages' && request.method === 'POST') {
        const msg = await request.json();
        msg.id = crypto.randomUUID();
        msg.timestamp = Date.now();
        const key = [msg.from, msg.to].sort().join(':');
        const prev = await env.KV.get('msgs:' + key, 'json') || [];
        prev.push(msg);
        await env.KV.put('msgs:' + key, JSON.stringify(prev.slice(-200)));
        return Response.json({ success: true }, { headers: cors });
      }
      if (path === '/api/messages' && request.method === 'GET') {
        const u1 = url.searchParams.get('user1');
        const u2 = url.searchParams.get('user2');
        const key = [u1, u2].sort().join(':');
        return Response.json(
          await env.KV.get('msgs:' + key, 'json') || [],
          { headers: cors }
        );
      }

      // --- SIGNALING (WebRTC) ---
      if (path === '/api/signal' && request.method === 'POST') {
        const d = await request.json();
        await env.KV.put('sig:' + d.to, JSON.stringify(d), { expirationTtl: 30 });
        return Response.json({ ok: 1 }, { headers: cors });
      }
      if (path === '/api/signal' && request.method === 'GET') {
        const id = url.searchParams.get('userId');
        const d = await env.KV.get('sig:' + id, 'json');
        if (d) await env.KV.delete('sig:' + id);
        return Response.json(d || null, { headers: cors });
      }

      // --- CALL NOTIFICATIONS ---
      if (path === '/api/call' && request.method === 'POST') {
        const d = await request.json();
        await env.KV.put('call:' + d.to, JSON.stringify(d), { expirationTtl: 30 });
        return Response.json({ ok: 1 }, { headers: cors });
      }
      if (path === '/api/call' && request.method === 'GET') {
        const id = url.searchParams.get('userId');
        const d = await env.KV.get('call:' + id, 'json');
        if (d) await env.KV.delete('call:' + id);
        return Response.json(d || null, { headers: cors });
      }

      // --- WORLD CHAT ---
      if (path === '/api/world' && request.method === 'POST') {
        const msg = await request.json();
        msg.id = crypto.randomUUID();
        msg.timestamp = Date.now();
        const prev = await env.KV.get('world', 'json') || [];
        prev.push(msg);
        await env.KV.put('world', JSON.stringify(prev.slice(-200)));
        return Response.json({ ok: 1 }, { headers: cors });
      }
      if (path === '/api/world' && request.method === 'GET') {
        return Response.json(
          await env.KV.get('world', 'json') || [],
          { headers: cors }
        );
      }

      // --- USERS DIRECTORY ---
      if (path === '/api/users' && request.method === 'POST') {
        const d = await request.json();
        await env.KV.put('user:' + d.userId, JSON.stringify(d), { expirationTtl: 120 });
        return Response.json({ ok: 1 }, { headers: cors });
      }
      if (path === '/api/users' && request.method === 'GET') {
        const list = await env.KV.list({ prefix: 'user:' });
        const users = [];
        for (const k of list.keys) {
          const u = await env.KV.get(k.name, 'json');
          if (u) users.push(u);
        }
        return Response.json(users, { headers: cors });
      }

      // --- STATUS ---
      if (path === '/api/status' && request.method === 'POST') {
        const { userId, status } = await request.json();
        await env.KV.put('status:' + userId, JSON.stringify({ status, lastSeen: Date.now() }), { expirationTtl: 300 });
        return Response.json({ ok: 1 }, { headers: cors });
      }
      if (path === '/api/status' && request.method === 'GET') {
        const id = url.searchParams.get('userId');
        return Response.json(
          await env.KV.get('status:' + id, 'json') || { status: 'offline' },
          { headers: cors }
        );
      }

      // --- FILES ---
      if (path === '/api/files' && request.method === 'POST') {
        const fd = await request.formData();
        const f = fd.get('file');
        const uid = fd.get('userId');
        if (f) {
          const id = crypto.randomUUID();
          const buf = await f.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          await env.KV.put('file:' + id, b64, {
            metadata: { name: f.name, type: f.type, size: f.size, by: uid },
          });
          const fl = await env.KV.get('filelist', 'json') || [];
          fl.push({ id, name: f.name, type: f.type, size: f.size, by: uid, at: Date.now() });
          await env.KV.put('filelist', JSON.stringify(fl.slice(-50)));
          return Response.json({ ok: 1, id }, { headers: cors });
        }
        return Response.json({ error: 'no file' }, { headers: cors });
      }
      if (path === '/api/files' && request.method === 'GET') {
        return Response.json(
          await env.KV.get('filelist', 'json') || [],
          { headers: cors }
        );
      }
      if (path.startsWith('/api/files/') && request.method === 'GET') {
        const fileId = path.split('/api/files/')[1];
        const { value, metadata } = await env.KV.getWithMetadata('file:' + fileId);
        if (!value) return Response.json({ error: 'not found' }, { headers: cors });
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Response(bytes, {
          headers: {
            ...cors,
            'Content-Type': metadata?.type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${metadata?.name || 'file'}"`,
          },
        });
      }

      return Response.json({ app: "Mason's Phone API", version: "2.0" }, { headers: cors });
    } catch (err) {
      return Response.json({ error: err.message }, { headers: cors });
    }
  },
};
```

### 2d. Create `wrangler.toml`
```toml
name = "masons-phone-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"
```

### 2e. Create KV Namespace & Deploy
```bash
wrangler kv:namespace create "KV"
# Copy the output ID into wrangler.toml

wrangler deploy
```

Your API is now at: `https://masons-phone-api.YOUR-SUBDOMAIN.workers.dev`

---

## Step 3: Connect Frontend to Backend

1. Open your deployed website
2. Go through the setup wizard
3. On the "Backend Server" step, paste your Worker URL
4. OR go to Settings → Server Connection and paste it there

---

## Step 4: Call Your Friend!

1. **You** open the website, go to Home, copy your User ID
2. **Your friend** opens the same website on their Chromebook
3. They go through setup too, entering the SAME Worker URL
4. They go to **People** tab, paste your User ID, type your name
5. They click **📞 Call** or **📹 Video** — you'll get a notification!
6. You click **Accept** and you're connected via WebRTC!

---

## How It Actually Works

| Layer | Technology | What It Does |
|-------|-----------|--------------|
| Video/Audio | **WebRTC** | Direct peer-to-peer stream (no server needed after connection) |
| Signaling | **Cloudflare Worker + KV** | Exchanges connection info so peers can find each other |
| Messages | **Cloudflare Worker + KV** | Stores and syncs chat messages |
| Notifications | **Browser Notification API** | Shows OS-level notifications for incoming calls |
| Mic/Camera | **getUserMedia API** | Accesses real hardware (requires HTTPS) |
| STUN | **Google STUN servers** | Helps peers discover their public IP for connection |

All video/audio goes DIRECTLY between the two Chromebooks — not through any server. The server only helps them find each other.

---

## Free Tier Limits (Very Generous)
- **Cloudflare Workers**: 100,000 requests/day free
- **Cloudflare KV**: 100,000 reads/day, 1,000 writes/day free
- **GitHub Pages**: Unlimited
- **Cloudflare Pages**: Unlimited

For a few friends calling each other, you'll never hit these limits.
