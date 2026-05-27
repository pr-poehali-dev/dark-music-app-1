import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const FANART_URL =
  "https://cdn.poehali.dev/projects/f2dd484a-4610-4754-819a-8d1cb8c5e66b/files/05b07d0e-f6ae-4da7-bca1-2c85a5b6dce4.jpg";

const API_URL = "https://functions.poehali.dev/cb9a3746-2f46-4013-a717-077ef7cd9b26";

const DEMO_TRACKS = [
  { id: -1, title: "Baby Doll Remix Vol.1", artist: "NekoBeats Studio", duration: 195, cover_emoji: "🎀", color: "#f472b6", genre: "Remix", file_url: "" },
  { id: -2, title: "Baby Doll Lo-Fi Mix", artist: "CaféCat Records", duration: 212, cover_emoji: "🌸", color: "#a78bfa", genre: "Lo-Fi", file_url: "" },
  { id: -3, title: "Cat Café Morning", artist: "WhiskerTunes", duration: 168, cover_emoji: "☕", color: "#34d399", genre: "Ambient", file_url: "" },
  { id: -4, title: "Meow Parade", artist: "WhiskerTunes", duration: 143, cover_emoji: "🐱", color: "#fbbf24", genre: "Pop", file_url: "" },
  { id: -5, title: "Strawberry Milk Beats", artist: "CaféCat Records", duration: 201, cover_emoji: "🍓", color: "#fb923c", genre: "Chillhop", file_url: "" },
];

type Track = {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover_emoji: string;
  color: string;
  genre: string;
  file_url: string;
};

const PAW_COLORS = ["#f472b6", "#a78bfa", "#60a5fa", "#34d399", "#fbbf24", "#fb923c"];

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PawButton({ color, onClick, children, size = 52, className = "" }: {
  color: string; onClick?: () => void; children: React.ReactNode; size?: number; className?: string;
}) {
  return (
    <button className={`paw-btn ${className}`} onClick={onClick}
      style={{ width: size, height: size,
        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}66)`,
        boxShadow: `0 4px 20px ${color}55, inset 0 1px 0 ${color}99` }}>
      {children}
    </button>
  );
}

function PawIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="26" rx="11" ry="9" fill="white" opacity="0.9" />
      <ellipse cx="9" cy="17" rx="4.5" ry="5.5" fill="white" opacity="0.9" />
      <ellipse cx="31" cy="17" rx="4.5" ry="5.5" fill="white" opacity="0.9" />
      <ellipse cx="14" cy="11" rx="3.5" ry="4.5" fill="white" opacity="0.9" />
      <ellipse cx="26" cy="11" rx="3.5" ry="4.5" fill="white" opacity="0.9" />
      <ellipse cx="20" cy="26" rx="7" ry="5" fill={color} opacity="0.6" />
      <ellipse cx="9" cy="17" rx="2.5" ry="3" fill={color} opacity="0.6" />
      <ellipse cx="31" cy="17" rx="2.5" ry="3" fill={color} opacity="0.6" />
      <ellipse cx="14" cy="11" rx="2" ry="2.5" fill={color} opacity="0.6" />
      <ellipse cx="26" cy="11" rx="2" ry="2.5" fill={color} opacity="0.6" />
    </svg>
  );
}

function TrackCard({ track, isPlaying, isActive, onPlay, onDelete }: {
  track: Track; isPlaying: boolean; isActive: boolean; onPlay: () => void; onDelete?: () => void;
}) {
  const isReal = track.id > 0;
  return (
    <div className={`glass-card p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${isActive ? "border-purple-400/40 bg-purple-500/10" : ""}`}
      onClick={onPlay}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `radial-gradient(circle, ${track.color}33, ${track.color}11)`, border: `1px solid ${track.color}44` }}>
        {track.cover_emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate ${isActive ? "text-purple-300" : "text-white"}`}>{track.title}</div>
        <div className="text-xs text-white/40 truncate">{track.artist} {isReal && <span className="text-purple-400/60">✓</span>}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive && isPlaying && (
          <div className="flex gap-0.5 items-end h-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-0.5 rounded-full"
                style={{ background: track.color, height: "100%",
                  animation: `paw-bounce ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
        <span className="text-xs text-white/30">{formatTime(track.duration)}</span>
        {isReal && onDelete && (
          <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Icon name="Trash2" size={14} className="text-red-400/60 hover:text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: (t: Track) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Other");
  const [emoji, setEmoji] = useState("🎵");
  const [colorIdx, setColorIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const name = f.name.replace(/\.[^.]+$/, "");
    if (!title) setTitle(name);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const arrayBuf = await file.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: b64,
          title: title || file.name,
          artist: artist || "Неизвестный",
          genre,
          cover_emoji: emoji,
          color: PAW_COLORS[colorIdx],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onUploaded(data);
        onClose();
      } else {
        setError(data.error || "Ошибка загрузки");
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const emojis = ["🎵", "🎀", "🌸", "💜", "☕", "🐱", "🍓", "🌙", "🎸", "⭐", "🔮", "🌺"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="glass-card w-full max-w-md rounded-b-none p-6 animate-slide-up"
        style={{ borderBottom: "none", borderRadius: "1.5rem 1.5rem 0 0" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white text-lg">🎵 Добавить трек</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
        </div>

        <div
          className="border-2 border-dashed rounded-2xl p-6 text-center mb-4 cursor-pointer transition-all"
          style={{ borderColor: file ? "#a78bfa66" : "rgba(255,255,255,0.1)", background: file ? "rgba(167,139,250,0.05)" : "transparent" }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <input ref={fileRef} type="file" accept="audio/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {file ? (
            <>
              <div className="text-3xl mb-2">🎧</div>
              <div className="text-white font-bold text-sm truncate">{file.name}</div>
              <div className="text-white/30 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} МБ</div>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">📂</div>
              <div className="text-white/40 text-sm">Перетащи файл или нажми</div>
              <div className="text-white/20 text-xs mt-1">MP3, WAV, OGG, FLAC</div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название трека"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Исполнитель"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <select value={genre} onChange={(e) => setGenre(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(20,15,40,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {["Remix", "Lo-Fi", "Ambient", "Pop", "Synthwave", "Chillhop", "Dream Pop", "Acoustic", "Other"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <div className="text-xs text-white/30 mb-2">Иконка</div>
          <div className="flex flex-wrap gap-2">
            {emojis.map((e) => (
              <button key={e} onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-xl text-xl transition-all"
                style={{ background: emoji === e ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
                  border: emoji === e ? "1px solid rgba(167,139,250,0.5)" : "1px solid transparent" }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <div className="text-xs text-white/30 mb-2">Цвет</div>
          <div className="flex gap-2">
            {PAW_COLORS.map((c, i) => (
              <button key={c} onClick={() => setColorIdx(i)}
                className="w-8 h-8 rounded-full transition-all"
                style={{ background: c, boxShadow: colorIdx === i ? `0 0 12px ${c}` : "none",
                  border: colorIdx === i ? "2px solid white" : "2px solid transparent" }} />
            ))}
          </div>
        </div>

        {error && <div className="text-red-400 text-xs mb-3 text-center">{error}</div>}

        <button onClick={handleUpload} disabled={!file || loading}
          className="w-full py-3 rounded-2xl font-black text-white text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", boxShadow: "0 8px 24px rgba(167,139,250,0.3)" }}>
          {loading ? "Загружаю... 🐾" : "Добавить трек 🎵"}
        </button>
      </div>
    </div>
  );
}

function PlayerPage({ track, isPlaying, progress, duration, onPlayPause, onNext, onPrev, onSeek }: {
  track: Track; isPlaying: boolean; progress: number; duration: number;
  onPlayPause: () => void; onNext: () => void; onPrev: () => void; onSeek: (v: number) => void;
}) {
  const isReal = track.id > 0 && track.file_url;
  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-2 animate-fade-in">
      <div className="relative">
        <div className={`w-52 h-52 rounded-full overflow-hidden border-4 flex items-center justify-center ${isPlaying && isReal ? "animate-spin-slow" : ""}`}
          style={{ borderColor: track.color + "88" }}>
          <div className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: `radial-gradient(circle at 40% 40%, ${track.color}22, ${track.color}08)` }}>
            {track.cover_emoji}
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: `${track.color}33`, border: `2px solid ${track.color}66` }}>
          {isReal ? "🎧" : "🎵"}
        </div>
        {isPlaying && isReal && (
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 40px ${track.color}44`, animation: "pulse-glow 2s ease-in-out infinite" }} />
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-white">{track.title}</h2>
        <p className="text-sm text-white/50 mt-1">{track.artist}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs px-3 py-0.5 rounded-full"
            style={{ background: `${track.color}22`, color: track.color, border: `1px solid ${track.color}44` }}>
            {track.genre}
          </span>
          {!isReal && (
            <span className="text-xs px-2 py-0.5 rounded-full text-white/30"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              демо
            </span>
          )}
        </div>
      </div>

      <div className="w-full px-2">
        <div className="track-progress" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - rect.left) / rect.width) * (duration || track.duration));
        }}>
          <div className="track-progress-fill" style={{
            width: `${(progress / (duration || track.duration || 1)) * 100}%`,
            background: `linear-gradient(90deg, ${track.color}, #f472b6)`,
          }} />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration || track.duration)}</span>
        </div>
      </div>

      {!isReal && (
        <div className="px-4 py-2.5 rounded-2xl text-xs text-center text-white/40 w-full"
          style={{ background: "rgba(167,139,250,0.06)", border: "1px dashed rgba(167,139,250,0.2)" }}>
          🎵 Демо-трек — загрузи свою музыку в Библиотеку
        </div>
      )}

      <div className="flex items-center gap-4">
        <PawButton color="#60a5fa" onClick={onPrev} size={48}>
          <Icon name="SkipBack" size={18} className="text-white" />
        </PawButton>
        <PawButton color={track.color} onClick={onPlayPause} size={68}>
          <Icon name={isPlaying && isReal ? "Pause" : "Play"} size={28} className="text-white" />
        </PawButton>
        <PawButton color="#a78bfa" onClick={onNext} size={48}>
          <Icon name="SkipForward" size={18} className="text-white" />
        </PawButton>
      </div>

      <div className="flex gap-3">
        <PawButton color="#fbbf24" size={36}><Icon name="Shuffle" size={14} className="text-white" /></PawButton>
        <PawButton color="#34d399" size={36}><Icon name="Repeat" size={14} className="text-white" /></PawButton>
        <PawButton color="#fb923c" size={36}><Icon name="Heart" size={14} className="text-white" /></PawButton>
        <PawButton color="#f472b6" size={36}><Icon name="Share2" size={14} className="text-white" /></PawButton>
      </div>
    </div>
  );
}

function LibraryPage({ tracks, currentTrack, isPlaying, onPlay, onDelete, onUpload, loading }: {
  tracks: Track[]; currentTrack: Track; isPlaying: boolean;
  onPlay: (t: Track) => void; onDelete: (id: number) => void; onUpload: () => void; loading: boolean;
}) {
  const [filter, setFilter] = useState("Все");
  const userTracks = tracks.filter((t) => t.id > 0);
  const allTracks = [...userTracks, ...DEMO_TRACKS];
  const genres = ["Все", ...Array.from(new Set(allTracks.map((t) => t.genre)))];
  const filtered = filter === "Все" ? allTracks : allTracks.filter((t) => t.genre === filter);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {genres.slice(0, 5).map((g) => (
            <button key={g} onClick={() => setFilter(g)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={filter === g
                ? { background: "rgba(167,139,250,0.3)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.5)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {g}
            </button>
          ))}
        </div>
        <button onClick={onUpload}
          className="ml-2 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", boxShadow: "0 4px 16px rgba(167,139,250,0.4)" }}>
          <Icon name="Plus" size={18} className="text-white" />
        </button>
      </div>

      {loading && (
        <div className="text-center py-4 text-white/30 text-sm">Загрузка треков...</div>
      )}

      {userTracks.length === 0 && !loading && (
        <div className="glass-card p-6 text-center cursor-pointer hover:scale-[1.02] transition-transform" onClick={onUpload}>
          <div className="text-4xl mb-3">🎵</div>
          <div className="font-black text-white mb-1">Добавь свою музыку</div>
          <div className="text-xs text-white/30">MP3, WAV, OGG, FLAC — любой формат</div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((t) => (
          <TrackCard key={t.id} track={t} isPlaying={isPlaying} isActive={currentTrack.id === t.id}
            onPlay={() => onPlay(t)}
            onDelete={t.id > 0 ? () => onDelete(t.id) : undefined} />
        ))}
      </div>
    </div>
  );
}

function PlaylistsPage({ onPlay, tracks }: { onPlay: (t: Track) => void; tracks: Track[] }) {
  const PLAYLISTS = [
    { id: 1, name: "Baby Doll Remixes", cover: "🎀", count: 4, color: "#f472b6" },
    { id: 2, name: "Cat Café Vibes", cover: "☕", count: 4, color: "#34d399" },
    { id: 3, name: "Мои треки", cover: "💜", count: tracks.filter((t) => t.id > 0).length, color: "#a78bfa" },
  ];

  const allTracks = [...tracks.filter((t) => t.id > 0), ...DEMO_TRACKS].slice(0, 3);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {PLAYLISTS.map((pl) => (
          <div key={pl.id} className="glass-card p-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onPlay(allTracks[0] || DEMO_TRACKS[0])}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3"
              style={{ background: `radial-gradient(circle, ${pl.color}33, ${pl.color}11)`, border: `1px solid ${pl.color}44` }}>
              {pl.cover}
            </div>
            <div className="font-black text-white text-sm">{pl.name}</div>
            <div className="text-xs text-white/30 mt-0.5">{pl.count} треков</div>
          </div>
        ))}
        <div className="glass-card p-4 cursor-pointer hover:scale-105 transition-transform flex flex-col items-center justify-center min-h-[120px] border-dashed">
          <div className="text-3xl mb-2">➕</div>
          <div className="text-xs text-white/30 text-center font-bold">Новый плейлист</div>
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-black text-white mb-1 flex items-center gap-2"><span>🔮</span> Рекомендации</h3>
        <p className="text-xs text-white/40 mb-3">На основе истории прослушиваний</p>
        <div className="flex flex-col gap-2">
          {allTracks.map((t) => (
            <TrackCard key={t.id} track={t} isPlaying={false} isActive={false} onPlay={() => onPlay(t)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ tracks }: { tracks: Track[] }) {
  const userCount = tracks.filter((t) => t.id > 0).length;
  const stats = [
    { label: "Загружено", value: String(userCount || 0), icon: "🎵" },
    { label: "Жанр", value: "Lo-Fi", icon: "💜" },
    { label: "Часов", value: "89", icon: "⏱️" },
    { label: "Плейлисты", value: "3", icon: "📋" },
  ];
  const history = DEMO_TRACKS.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/50">
            <img src={FANART_URL} alt="Профиль" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 text-xl">🐰</div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black text-white">Сайори</h2>
          <p className="text-xs text-purple-300">@sayori_neko</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-base font-black text-purple-300">{s.value}</div>
            <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <h3 className="font-black text-white mb-3 flex items-center gap-2"><span>🕐</span> История</h3>
        <div className="flex flex-col gap-2">
          {history.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <span className="text-white/20 text-xs w-4">{i + 1}</span>
              <span className="text-lg">{t.cover_emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white/80 truncate">{t.title}</div>
                <div className="text-xs text-white/30">{t.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [quality, setQuality] = useState("Высокое");
  const [volume, setVolume] = useState(80);

  const toggles = [
    { icon: "🎨", label: "Тёмная тема", val: darkMode, set: () => setDarkMode((v) => !v) },
    { icon: "🔔", label: "Уведомления", val: notifications, set: () => setNotifications((v) => !v) },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="glass-card p-4 flex flex-col gap-1">
        {toggles.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <button onClick={item.set} className="w-12 h-6 rounded-full transition-all relative"
              style={{ background: item.val ? "linear-gradient(90deg, #a78bfa, #f472b6)" : "rgba(255,255,255,0.1)" }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all" style={{ left: item.val ? "28px" : "4px" }} />
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🔊</span>
          <span className="text-sm font-bold text-white">Громкость: {volume}%</span>
        </div>
        <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-purple-400" />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🎧</span>
          <span className="text-sm font-bold text-white">Качество звука</span>
        </div>
        <div className="flex gap-2">
          {["Низкое", "Среднее", "Высокое"].map((q) => (
            <button key={q} onClick={() => setQuality(q)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={quality === q
                ? { background: "rgba(167,139,250,0.3)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.5)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">🐾</span>
          <span className="text-sm font-bold text-white">О приложении</span>
        </div>
        <p className="text-xs text-white/30">NekoBeats v1.0 — фанатское музыкальное приложение</p>
        <p className="text-lg text-white/25 mt-1 font-caveat">Сайори & Спраут 💜</p>
      </div>
    </div>
  );
}

function HomeHero({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 stars-bg animate-fade-in">
      <div className="relative mb-8">
        <div className="animate-float">
          <img src={FANART_URL} alt="Сайори в костюме Джекса со Спраутом"
            className="w-64 h-64 object-cover rounded-3xl"
            style={{ boxShadow: "0 0 60px rgba(167,139,250,0.4), 0 20px 60px rgba(0,0,0,0.5)", border: "2px solid rgba(167,139,250,0.3)" }} />
        </div>
        <div className="absolute -top-3 -right-3 text-3xl animate-float" style={{ animationDelay: "0.5s" }}>🐾</div>
        <div className="absolute -bottom-3 -left-3 text-3xl animate-float" style={{ animationDelay: "1s" }}>🍓</div>
        <div className="absolute top-4 -left-6 text-2xl animate-float" style={{ animationDelay: "1.5s" }}>🎵</div>
        <div className="absolute bottom-8 -right-6 text-2xl animate-float" style={{ animationDelay: "0.8s" }}>💜</div>
      </div>

      <h1 className="text-4xl font-black text-center mb-2"
        style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        NekoBeats
      </h1>
      <p className="text-white/40 text-sm text-center mb-1">Сайори 🐰 & Спраут 🍓</p>
      <p className="text-white/25 text-center mb-8 font-caveat text-lg">Baby Doll Remixes · Cat Café Melodies</p>

      <div className="flex gap-3 mb-8">
        {[
          { color: "#f472b6", delay: "0s" },
          { color: "#a78bfa", delay: "0.15s" },
          { color: "#60a5fa", delay: "0.3s" },
          { color: "#34d399", delay: "0.45s" },
          { color: "#fbbf24", delay: "0.6s" },
        ].map((p, i) => (
          <div key={i} className="animate-float" style={{ animationDelay: p.delay }}>
            <PawIcon color={p.color} size={28} />
          </div>
        ))}
      </div>

      <button onClick={onEnter}
        className="px-8 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", boxShadow: "0 8px 32px rgba(167,139,250,0.4)" }}>
        🎵 Войти в NekoBeats
      </button>
    </div>
  );
}

const NAV = [
  { id: "player", label: "Плеер", icon: "Music" },
  { id: "library", label: "Библиотека", icon: "Library" },
  { id: "playlists", label: "Плейлисты", icon: "ListMusic" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const Index = () => {
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState("player");
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(DEMO_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allTracks = [...userTracks, ...DEMO_TRACKS];

  // Загрузка треков с сервера
  const fetchTracks = useCallback(async () => {
    setLoadingTracks(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUserTracks(data.tracks || []);
    } catch {
      setUserTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  // Audio element управление
  useEffect(() => {
    if (!currentTrack.file_url) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    if (audio.src !== currentTrack.file_url) {
      audio.src = currentTrack.file_url;
      audio.load();
      setProgress(0);
      setAudioDuration(0);
    }

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDuration = () => setAudioDuration(audio.duration || 0);
    const onEnded = () => handleNext();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnded);

    if (isPlaying) { audio.play().catch(() => setIsPlaying(false)); }
    else { audio.pause(); }

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isPlaying]);

  const handleNext = () => {
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    setCurrentTrack(allTracks[(idx + 1) % allTracks.length]);
    setProgress(0);
  };

  const handlePrev = () => {
    const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
    setCurrentTrack(allTracks[(idx - 1 + allTracks.length) % allTracks.length]);
    setProgress(0);
  };

  const handlePlay = (track: Track) => {
    if (currentTrack.id === track.id) {
      if (track.file_url) setIsPlaying((p) => !p);
    } else {
      setCurrentTrack(track);
      setProgress(0);
      if (track.file_url) setIsPlaying(true);
      else setIsPlaying(false);
    }
    setActiveTab("player");
  };

  const handleSeek = (v: number) => {
    setProgress(v);
    if (audioRef.current && currentTrack.file_url) audioRef.current.currentTime = v;
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    setUserTracks((prev) => prev.filter((t) => t.id !== id));
    if (currentTrack.id === id) { setCurrentTrack(DEMO_TRACKS[0]); setIsPlaying(false); }
  };

  const handleUploaded = (track: Track) => {
    setUserTracks((prev) => [track, ...prev]);
    setCurrentTrack(track);
    setIsPlaying(true);
    setActiveTab("player");
  };

  if (showHome) return <HomeHero onEnter={() => setShowHome(false)} />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto stars-bg">
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}

      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>
        <button onClick={() => setShowHome(true)} className="flex items-center gap-2">
          <PawIcon color="#a78bfa" size={24} />
          <span className="font-black text-lg"
            style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NekoBeats
          </span>
        </button>
        <div className="flex items-center gap-2">
          {isPlaying && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#a78bfa" }} />}
          <span className="text-white/30 text-xs truncate max-w-[120px]">{currentTrack.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "player" && (
          <PlayerPage track={currentTrack} isPlaying={isPlaying} progress={progress} duration={audioDuration}
            onPlayPause={() => { if (currentTrack.file_url) setIsPlaying((p) => !p); }}
            onNext={handleNext} onPrev={handlePrev} onSeek={handleSeek} />
        )}
        {activeTab === "library" && (
          <LibraryPage tracks={userTracks} currentTrack={currentTrack} isPlaying={isPlaying}
            onPlay={handlePlay} onDelete={handleDelete} onUpload={() => setShowUpload(true)} loading={loadingTracks} />
        )}
        {activeTab === "playlists" && <PlaylistsPage onPlay={handlePlay} tracks={userTracks} />}
        {activeTab === "profile" && <ProfilePage tracks={userTracks} />}
        {activeTab === "settings" && <SettingsPage />}
      </div>

      <div className="flex items-center justify-around px-2 py-2 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(167,139,250,0.1)", background: "rgba(10,8,20,0.8)", backdropFilter: "blur(20px)" }}>
        {NAV.map((item) => (
          <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
            <Icon name={item.icon as "Music"} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
