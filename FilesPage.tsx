import { useState } from 'react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'archive' | 'code';
  shared: boolean;
  timestamp: number;
  from: string;
}

const demoFiles: FileItem[] = [
  { id: '1', name: 'project-notes.txt', size: '2.4 KB', type: 'document', shared: false, timestamp: Date.now() - 100000, from: 'me' },
  { id: '2', name: 'screenshot.png', size: '340 KB', type: 'image', shared: true, timestamp: Date.now() - 200000, from: 'Alex' },
  { id: '3', name: 'homework.pdf', size: '1.2 MB', type: 'document', shared: true, timestamp: Date.now() - 300000, from: 'Mason' },
  { id: '4', name: 'song.mp3', size: '4.5 MB', type: 'audio', shared: false, timestamp: Date.now() - 400000, from: 'me' },
  { id: '5', name: 'game-clip.mp4', size: '12.3 MB', type: 'video', shared: true, timestamp: Date.now() - 500000, from: 'Jordan' },
  { id: '6', name: 'backup.zip', size: '8.1 MB', type: 'archive', shared: false, timestamp: Date.now() - 600000, from: 'me' },
  { id: '7', name: 'script.js', size: '5.6 KB', type: 'code', shared: true, timestamp: Date.now() - 700000, from: 'Taylor' },
  { id: '8', name: 'wallpaper.jpg', size: '2.1 MB', type: 'image', shared: true, timestamp: Date.now() - 800000, from: 'Drew' },
  { id: '9', name: 'presentation.pdf', size: '3.4 MB', type: 'document', shared: false, timestamp: Date.now() - 900000, from: 'me' },
];

const typeIcons: Record<string, string> = {
  image: '🖼️',
  document: '📄',
  audio: '🎵',
  video: '🎬',
  archive: '📦',
  code: '💻',
};

const typeColors: Record<string, string> = {
  image: 'from-pink-500/20 to-purple-500/20 border-pink-500/20',
  document: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
  audio: 'from-green-500/20 to-emerald-500/20 border-green-500/20',
  video: 'from-red-500/20 to-orange-500/20 border-red-500/20',
  archive: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20',
  code: 'from-violet-500/20 to-indigo-500/20 border-violet-500/20',
};

export function FilesPage() {
  const [filter, setFilter] = useState<'all' | 'shared' | 'mine'>('all');
  const [search, setSearch] = useState('');

  const filtered = demoFiles
    .filter(f => {
      if (filter === 'shared') return f.shared;
      if (filter === 'mine') return f.from === 'me';
      return true;
    })
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const totalSize = demoFiles.reduce((acc, f) => {
    const num = parseFloat(f.size);
    const unit = f.size.includes('MB') ? 1024 : 1;
    return acc + num * unit;
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-white">📁 Files</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-white">{demoFiles.length}</p>
          <p className="text-[10px] text-slate-400">Total Files</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-400">{demoFiles.filter(f => f.shared).length}</p>
          <p className="text-[10px] text-slate-400">Shared</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{(totalSize / 1024).toFixed(1)} MB</p>
          <p className="text-[10px] text-slate-400">Total Size</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full glass rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'shared', 'mine'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/50' : 'bg-slate-800/50 text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filtered.map(file => (
          <div
            key={file.id}
            className={`glass rounded-xl p-3 flex items-center gap-3 bg-gradient-to-r ${typeColors[file.type]} hover:scale-[1.01] transition-all cursor-pointer`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center text-xl">
              {typeIcons[file.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-400">{file.size}</span>
                {file.shared && <span className="text-[10px] text-blue-400">• from {file.from}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {file.shared && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Shared</span>
              )}
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white text-sm">
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-3xl mb-2">📂</p>
          <p className="text-sm">No files found</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
