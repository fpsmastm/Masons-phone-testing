import { useState } from 'react';
import { useApp } from '../store';
import { getApiUrl, setApiUrl } from '../services/api';

const backgrounds = [
  { id: 'default', name: 'Dark Storm', colors: 'from-slate-950 via-slate-900 to-slate-950' },
  { id: 'midnight', name: 'Midnight Blue', colors: 'from-blue-950 via-slate-900 to-indigo-950' },
  { id: 'aurora', name: 'Aurora', colors: 'from-emerald-950 via-slate-900 to-purple-950' },
  { id: 'crimson', name: 'Crimson Night', colors: 'from-red-950 via-slate-900 to-rose-950' },
  { id: 'ocean', name: 'Deep Ocean', colors: 'from-cyan-950 via-slate-950 to-blue-950' },
  { id: 'void', name: 'The Void', colors: 'from-black via-slate-950 to-black' },
  { id: 'sunset', name: 'Sunset Rain', colors: 'from-orange-950 via-slate-900 to-purple-950' },
  { id: 'forest', name: 'Dark Forest', colors: 'from-green-950 via-slate-950 to-emerald-950' },
];

const avatars = ['😎', '🧑‍💻', '🎮', '🎵', '📱', '🎨', '⚡', '🌙', '🔥', '🦊', '🐱', '🤖', '👾', '🎯', '🌊', '💎'];

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const { settings } = state;
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [showWorkerCode, setShowWorkerCode] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 animate-fade-in">
      <h1 className="text-xl font-bold text-white">⚙️ Settings</h1>

      {/* Profile */}
      <section className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Profile</h2>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl border-2 border-blue-400/30">
            {state.avatar}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={state.username}
              onChange={e => dispatch({ type: 'SET_USER', userId: state.userId, username: e.target.value, avatar: state.avatar })}
              className="bg-slate-800/50 rounded-lg px-3 py-1.5 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
            <p className="text-xs text-slate-500 font-mono mt-1">{state.userId}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2">Choose Avatar</p>
          <div className="grid grid-cols-8 gap-2">
            {avatars.map(a => (
              <button
                key={a}
                onClick={() => dispatch({ type: 'SET_USER', userId: state.userId, username: state.username, avatar: a })}
                className={`text-2xl p-1.5 rounded-lg transition-all hover:scale-110 ${
                  state.avatar === a ? 'bg-blue-600/30 ring-1 ring-blue-500' : 'hover:bg-white/5'
                }`}
              >{a}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Server Setup */}
      <section className="glass rounded-2xl p-4 space-y-3 border border-emerald-500/20">
        <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">🌐 Server Connection</h2>
        <p className="text-xs text-slate-400">Connect to your Cloudflare Worker backend for real messaging & calls between devices.</p>
        <input
          type="text"
          value={apiUrlInput}
          onChange={e => setApiUrlInput(e.target.value)}
          placeholder="https://masons-phone-api.workers.dev"
          className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
        />
        <button
          onClick={() => { if (apiUrlInput) setApiUrl(apiUrlInput); }}
          className="w-full py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-sm font-medium hover:bg-emerald-600/30 transition-all"
        >
          💾 Save & Reconnect
        </button>

        <button
          onClick={() => setShowWorkerCode(!showWorkerCode)}
          className="w-full py-2 rounded-lg bg-slate-800/50 text-blue-400 text-sm font-medium hover:bg-slate-700/50 transition-all"
        >
          {showWorkerCode ? '▼ Hide' : '▶ Show'} Full Cloudflare Worker Code & Deploy Guide
        </button>

        {showWorkerCode && (
          <div className="space-y-3 text-xs text-slate-300 animate-slide-up">
            <div className="bg-slate-900/80 rounded-xl p-4 space-y-2 font-mono text-[11px] overflow-x-auto max-h-96 overflow-y-auto">
              <p className="text-green-400">{'// ===== worker.js ====='}</p>
              <p className="text-green-400">{'// Deploy this to Cloudflare Workers'}</p>
              <p className="text-green-400">{'// It handles: messages, signaling, calls, files, world chat, user directory'}</p>
              <p>&nbsp;</p>
              <p className="text-yellow-300">{'export default {'}</p>
              <p>{'  async fetch(request, env) {'}</p>
              <p>{'    const url = new URL(request.url);'}</p>
              <p>{'    const path = url.pathname;'}</p>
              <p>{'    const cors = {'}</p>
              <p>{"      'Access-Control-Allow-Origin': '*',"}</p>
              <p>{"      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',"}</p>
              <p>{"      'Access-Control-Allow-Headers': 'Content-Type',"}</p>
              <p>{'    };'}</p>
              <p>{"    if (request.method === 'OPTIONS')"}</p>
              <p>{'      return new Response(null, { headers: cors });'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- MESSAGES ---'}</p>
              <p>{"    if (path === '/api/messages' && request.method === 'POST') {'}"}</p>
              <p>{'      const msg = await request.json();'}</p>
              <p>{"      msg.id = crypto.randomUUID(); msg.timestamp = Date.now();"}</p>
              <p>{"      const key = [msg.from, msg.to].sort().join(':');"}</p>
              <p>{"      const prev = await env.KV.get('msgs:'+key,'json') || [];"}</p>
              <p>{'      prev.push(msg);'}</p>
              <p>{"      await env.KV.put('msgs:'+key, JSON.stringify(prev.slice(-200)));"}</p>
              <p>{"      return Response.json({success:true}, {headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/messages' && request.method === 'GET') {'}"}</p>
              <p>{"      const u1=url.searchParams.get('user1'), u2=url.searchParams.get('user2');"}</p>
              <p>{"      const key = [u1,u2].sort().join(':');"}</p>
              <p>{"      return Response.json(await env.KV.get('msgs:'+key,'json')||[], {headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- SIGNALING ---'}</p>
              <p>{"    if (path === '/api/signal' && request.method === 'POST') {'}"}</p>
              <p>{'      const d = await request.json();'}</p>
              <p>{"      await env.KV.put('sig:'+d.to, JSON.stringify(d), {expirationTtl:30});"}</p>
              <p>{"      return Response.json({ok:1},{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/signal' && request.method === 'GET') {'}"}</p>
              <p>{"      const id=url.searchParams.get('userId');"}</p>
              <p>{"      const d=await env.KV.get('sig:'+id,'json');"}</p>
              <p>{"      if(d) await env.KV.delete('sig:'+id);"}</p>
              <p>{"      return Response.json(d||null,{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- CALL NOTIFICATIONS ---'}</p>
              <p>{"    if (path === '/api/call' && request.method === 'POST') {'}"}</p>
              <p>{'      const d = await request.json();'}</p>
              <p>{"      await env.KV.put('call:'+d.to, JSON.stringify(d), {expirationTtl:30});"}</p>
              <p>{"      return Response.json({ok:1},{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/call' && request.method === 'GET') {'}"}</p>
              <p>{"      const id=url.searchParams.get('userId');"}</p>
              <p>{"      const d=await env.KV.get('call:'+id,'json');"}</p>
              <p>{"      if(d) await env.KV.delete('call:'+id);"}</p>
              <p>{"      return Response.json(d||null,{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- WORLD CHAT ---'}</p>
              <p>{"    if (path === '/api/world' && request.method === 'POST') {'}"}</p>
              <p>{'      const msg=await request.json();'}</p>
              <p>{"      msg.id=crypto.randomUUID(); msg.timestamp=Date.now();"}</p>
              <p>{"      const prev=await env.KV.get('world','json')||[];"}</p>
              <p>{'      prev.push(msg);'}</p>
              <p>{"      await env.KV.put('world',JSON.stringify(prev.slice(-200)));"}</p>
              <p>{"      return Response.json({ok:1},{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/world' && request.method === 'GET') {'}"}</p>
              <p>{"      return Response.json(await env.KV.get('world','json')||[],{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- USERS ---'}</p>
              <p>{"    if (path === '/api/users' && request.method === 'POST') {'}"}</p>
              <p>{'      const d=await request.json();'}</p>
              <p>{"      await env.KV.put('user:'+d.userId,JSON.stringify(d),{expirationTtl:120});"}</p>
              <p>{"      return Response.json({ok:1},{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/users' && request.method === 'GET') {'}"}</p>
              <p>{"      const list=await env.KV.list({prefix:'user:'});"}</p>
              <p>{'      const users=[];'}</p>
              <p>{"      for(const k of list.keys){'}"}</p>
              <p>{"        const u=await env.KV.get(k.name,'json');"}</p>
              <p>{'        if(u) users.push(u);'}</p>
              <p>{'      }'}</p>
              <p>{"      return Response.json(users,{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p className="text-green-400">{'    // --- FILES ---'}</p>
              <p>{"    if (path === '/api/files' && request.method === 'POST') {'}"}</p>
              <p>{'      const fd=await request.formData();'}</p>
              <p>{"      const f=fd.get('file'), uid=fd.get('userId');"}</p>
              <p>{'      if(f){'}</p>
              <p>{'        const id=crypto.randomUUID();'}</p>
              <p>{'        const buf=await f.arrayBuffer();'}</p>
              <p>{'        const b64=btoa(String.fromCharCode(...new Uint8Array(buf)));'}</p>
              <p>{"        await env.KV.put('file:'+id, b64, {metadata:{name:f.name,type:f.type,size:f.size,by:uid}});"}</p>
              <p>{"        const fl=await env.KV.get('filelist','json')||[];"}</p>
              <p>{"        fl.push({id,name:f.name,type:f.type,size:f.size,by:uid,at:Date.now()});"}</p>
              <p>{"        await env.KV.put('filelist',JSON.stringify(fl.slice(-50)));"}</p>
              <p>{"        return Response.json({ok:1,id},{headers:cors});"}</p>
              <p>{'      }'}</p>
              <p>{"      return Response.json({error:'no file'},{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>{"    if (path === '/api/files' && request.method === 'GET') {'}"}</p>
              <p>{"      return Response.json(await env.KV.get('filelist','json')||[],{headers:cors});"}</p>
              <p>{'    }'}</p>
              <p>&nbsp;</p>
              <p>{"    return Response.json({app:'Mason Phone API'},{headers:cors});"}</p>
              <p>{'  }'}</p>
              <p>{'};'}</p>
            </div>
            
            <div className="bg-slate-900/80 rounded-xl p-4 space-y-1 font-mono text-[11px]">
              <p className="text-green-400 font-sans text-xs font-bold mb-2">wrangler.toml:</p>
              <p>{'name = "masons-phone-api"'}</p>
              <p>{'main = "worker.js"'}</p>
              <p>{'compatibility_date = "2024-01-01"'}</p>
              <p>&nbsp;</p>
              <p>{'[[kv_namespaces]]'}</p>
              <p>{'binding = "KV"'}</p>
              <p>{'id = "YOUR_KV_ID_HERE"'}</p>
            </div>

            <div className="bg-slate-900/80 rounded-xl p-4 space-y-1 font-mono text-[11px]">
              <p className="text-green-400 font-sans text-xs font-bold mb-2">Deploy Steps:</p>
              <p className="text-yellow-300">npm install -g wrangler</p>
              <p className="text-yellow-300">wrangler login</p>
              <p className="text-yellow-300">wrangler kv:namespace create "KV"</p>
              <p className="text-slate-400"># Copy the ID into wrangler.toml</p>
              <p className="text-yellow-300">wrangler deploy</p>
              <p className="text-slate-400"># Your API is at https://masons-phone-api.YOUR.workers.dev</p>
              <p className="text-slate-400"># Paste that URL above!</p>
            </div>
          </div>
        )}
      </section>

      {/* Background */}
      <section className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Background</h2>
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map(bg => (
            <button
              key={bg.id}
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { background: bg.id } })}
              className={`rounded-xl p-3 bg-gradient-to-br ${bg.colors} border transition-all hover:scale-[1.02] ${
                settings.background === bg.id ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-white/5'
              }`}
            >
              <span className="text-xs text-white font-medium">{bg.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Rain */}
      <section className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Rain Effect</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Enable Rain</span>
          <button
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { rainEnabled: !settings.rainEnabled } })}
            className={`w-12 h-6 rounded-full transition-all ${settings.rainEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.rainEnabled ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {settings.rainEnabled && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400">Intensity</span>
              <span className="text-xs text-slate-400">{settings.rainIntensity}%</span>
            </div>
            <input type="range" min={10} max={100} value={settings.rainIntensity}
              onChange={e => dispatch({ type: 'UPDATE_SETTINGS', settings: { rainIntensity: Number(e.target.value) } })}
              className="w-full accent-blue-500" />
          </div>
        )}
      </section>

      {/* Chat */}
      <section className="glass rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Chat Settings</h2>
        <div>
          <p className="text-xs text-slate-400 mb-2">Font Size</p>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button key={size} onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { fontSize: size } })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  settings.fontSize === size ? 'bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/50' : 'bg-slate-800/50 text-slate-400'
                }`}>{size}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2">Bubble Style</p>
          <div className="flex gap-2">
            {(['rounded', 'sharp', 'pill'] as const).map(style => (
              <button key={style} onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { chatBubbleStyle: style } })}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  settings.chatBubbleStyle === style ? 'bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/50' : 'bg-slate-800/50 text-slate-400'
                } ${style === 'rounded' ? 'rounded-xl' : style === 'sharp' ? 'rounded-sm' : 'rounded-full'}`}>{style}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Show Timestamps</span>
          <button onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { showTimestamps: !settings.showTimestamps } })}
            className={`w-12 h-6 rounded-full transition-all ${settings.showTimestamps ? 'bg-blue-600' : 'bg-slate-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.showTimestamps ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </section>

      {/* Reset */}
      <section className="glass rounded-2xl p-4 space-y-3 border border-red-900/30">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Danger Zone</h2>
        <button
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="w-full py-2 rounded-lg bg-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/30 transition-all"
        >
          Reset Everything (Clear All Data)
        </button>
      </section>

      <div className="h-4" />
    </div>
  );
}
