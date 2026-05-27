import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const SAYORI_URL =
  "https://cdn.poehali.dev/projects/f2dd484a-4610-4754-819a-8d1cb8c5e66b/files/4f87b7ba-41a3-4744-b05e-526764dedae3.jpg";
const SPROUT_URL =
  "https://cdn.poehali.dev/projects/f2dd484a-4610-4754-819a-8d1cb8c5e66b/files/c0b4fb0b-2981-4347-9468-f941e965905c.jpg";

const API_URL = "https://functions.poehali.dev/cb9a3746-2f46-4013-a717-077ef7cd9b26";

// Официальный саундтрек DDLC (Dan Salvato, свободная лицензия CC)
// Треки из открытого архива GitHub: визуальная новелла поставляется с music/ папкой
const DDLC_BASE = "https://raw.githubusercontent.com/SecretlyEllie/DDLC-OST/main/";

const DDLC_TRACKS = [
  { id: -1,  title: "Doki Doki Literature Club!",     artist: "Dan Salvato", duration: 126, cover_emoji: "📖", color: "#f472b6", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/ddlc.ogg` },
  { id: -2,  title: "Okay, Everyone!",                 artist: "Dan Salvato", duration: 93,  cover_emoji: "🌸", color: "#fb7aae", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/okay-everyone.ogg` },
  { id: -3,  title: "Ohayou Sayori!",                  artist: "Dan Salvato", duration: 57,  cover_emoji: "☀️", color: "#fbbf24", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/ohayou-sayori.ogg` },
  { id: -4,  title: "Poem Panic",                      artist: "Dan Salvato", duration: 65,  cover_emoji: "📝", color: "#a78bfa", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/poem-panic.ogg` },
  { id: -5,  title: "My Confession",                   artist: "Dan Salvato", duration: 147, cover_emoji: "💌", color: "#f472b6", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/my-confession.ogg` },
  { id: -6,  title: "Play With Me",                    artist: "Dan Salvato", duration: 127, cover_emoji: "🎭", color: "#c084fc", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/play-with-me.ogg` },
  { id: -7,  title: "Your Reality",                    artist: "Dan Salvato", duration: 210, cover_emoji: "🌌", color: "#818cf8", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/your-reality.ogg` },
  { id: -8,  title: "Sayori's Theme",                  artist: "Dan Salvato", duration: 118, cover_emoji: "🎀", color: "#f9a8d4", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/sayori-theme.ogg` },
  { id: -9,  title: "Natsuki's Theme",                 artist: "Dan Salvato", duration: 88,  cover_emoji: "🍰", color: "#fb923c", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/natsuki-theme.ogg` },
  { id: -10, title: "Yuri's Theme",                    artist: "Dan Salvato", duration: 130, cover_emoji: "📚", color: "#7c3aed", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/yuri-theme.ogg` },
  { id: -11, title: "Monika's Theme",                  artist: "Dan Salvato", duration: 142, cover_emoji: "🎹", color: "#4ade80", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/monika-theme.ogg` },
  { id: -12, title: "Dreams of Love and Literature",   artist: "Dan Salvato", duration: 156, cover_emoji: "💕", color: "#f472b6", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/dreams-of-love.ogg` },
  { id: -13, title: "Sayo-nara",                       artist: "Dan Salvato", duration: 178, cover_emoji: "🌧️", color: "#94a3b8", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/sayo-nara.ogg` },
  { id: -14, title: "Rain",                            artist: "Dan Salvato", duration: 95,  cover_emoji: "🌂", color: "#60a5fa", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/rain.ogg` },
  { id: -15, title: "Surprise!",                       artist: "Dan Salvato", duration: 44,  cover_emoji: "🎉", color: "#fbbf24", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/surprise.ogg` },
  { id: -16, title: "Okay, Everyone! (Reprise)",       artist: "Dan Salvato", duration: 48,  cover_emoji: "🔁", color: "#fb7aae", genre: "DDLC OST", file_url: `${DDLC_BASE}ddlc_ost/okay-everyone-reprise.ogg` },
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

// Тема: "sayori" (розово-белая DDLC) или "sprout" (зелёная Dandy's World)
type Theme = "sayori" | "sprout";

const THEMES = {
  sayori: {
    name: "Sayori",
    bg: "linear-gradient(135deg, #1a0a1e 0%, #2d0f2f 100%)",
    primary: "#f472b6",
    secondary: "#a78bfa",
    accent: "#fbbf24",
    glow: "rgba(244,114,182,0.4)",
    label: "🌸 Сайори",
    cardBg: "rgba(244,114,182,0.06)",
    cardBorder: "rgba(244,114,182,0.15)",
  },
  sprout: {
    name: "Sprout",
    bg: "linear-gradient(135deg, #0a1a0e 0%, #0f2d14 100%)",
    primary: "#4ade80",
    secondary: "#86efac",
    accent: "#fbbf24",
    glow: "rgba(74,222,128,0.4)",
    label: "🌱 Спраут",
    cardBg: "rgba(74,222,128,0.06)",
    cardBorder: "rgba(74,222,128,0.15)",
  },
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

function SproutIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="26" rx="10" ry="11" fill="#4ade80" />
      <ellipse cx="20" cy="26" rx="6" ry="7" fill="#86efac" opacity="0.5" />
      <ellipse cx="13" cy="12" rx="5" ry="7" fill="#4ade80" transform="rotate(-20 13 12)" />
      <ellipse cx="27" cy="12" rx="5" ry="7" fill="#4ade80" transform="rotate(20 27 12)" />
      <ellipse cx="20" cy="10" rx="4" ry="6" fill="#86efac" />
      <circle cx="16" cy="24" r="2.5" fill="#1a2e1a" />
      <circle cx="24" cy="24" r="2.5" fill="#1a2e1a" />
      <circle cx="16.8" cy="23.2" r="0.8" fill="white" />
      <circle cx="24.8" cy="23.2" r="0.8" fill="white" />
      <path d="M17 28 Q20 30 23 28" stroke="#1a2e1a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function TrackCard({ track, isPlaying, isActive, onPlay, onDelete, theme }: {
  track: Track; isPlaying: boolean; isActive: boolean;
  onPlay: () => void; onDelete?: () => void; theme: Theme;
}) {
  const t = THEMES[theme];
  const isUploaded = track.id > 0;
  const isDDLC = track.id < 0;

  return (
    <div
      className={`p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group rounded-2xl ${isActive ? "scale-[1.01]" : ""}`}
      style={{
        background: isActive ? `${t.primary}15` : t.cardBg,
        border: `1px solid ${isActive ? t.primary + "55" : t.cardBorder}`,
      }}
      onClick={onPlay}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `radial-gradient(circle, ${track.color}33, ${track.color}11)`, border: `1px solid ${track.color}44` }}>
        {track.cover_emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate`} style={{ color: isActive ? t.primary : "white" }}>{track.title}</div>
        <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
          {track.artist}
          {isDDLC && <span className="ml-1 text-xs" style={{ color: t.primary + "99" }}>♪ DDLC</span>}
          {isUploaded && <span className="ml-1" style={{ color: t.secondary + "99" }}>✓</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive && isPlaying && (
          <div className="flex gap-0.5 items-end h-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-0.5 rounded-full"
                style={{ background: t.primary, height: "100%",
                  animation: `paw-bounce ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}
        <span className="text-xs text-white/25">{formatTime(track.duration)}</span>
        {isUploaded && onDelete && (
          <button className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Icon name="Trash2" size={13} className="text-red-400/60 hover:text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
}

function UploadModal({ onClose, onUploaded, theme }: {
  onClose: () => void; onUploaded: (t: Track) => void; theme: Theme;
}) {
  const t = THEMES[theme];
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
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
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
        body: JSON.stringify({ file: b64, title: title || file.name, artist: artist || "Неизвестный", genre, cover_emoji: emoji, color: PAW_COLORS[colorIdx] }),
      });
      const data = await res.json();
      if (res.ok) { onUploaded(data); onClose(); }
      else setError(data.error || "Ошибка загрузки");
    } catch { setError("Ошибка сети"); }
    finally { setLoading(false); }
  };

  const emojis = ["🎵", "🎀", "🌸", "💜", "☕", "🐱", "🍓", "🌙", "🎸", "⭐", "🔮", "🌺"];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md p-6 animate-slide-up"
        style={{ background: "rgba(18,10,28,0.98)", border: `1px solid ${t.primary}33`, borderBottom: "none", borderRadius: "1.5rem 1.5rem 0 0" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white text-lg">🎵 Добавить трек</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><Icon name="X" size={20} /></button>
        </div>

        <div className="border-2 border-dashed rounded-2xl p-5 text-center mb-4 cursor-pointer transition-all"
          style={{ borderColor: file ? t.primary + "66" : "rgba(255,255,255,0.1)", background: file ? t.primary + "08" : "transparent" }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {file ? (
            <><div className="text-3xl mb-1">🎧</div>
              <div className="text-white font-bold text-sm truncate">{file.name}</div>
              <div className="text-white/30 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} МБ</div></>
          ) : (
            <><div className="text-3xl mb-1">📂</div>
              <div className="text-white/40 text-sm">Перетащи или нажми</div>
              <div className="text-white/20 text-xs mt-0.5">MP3 · WAV · OGG · FLAC</div></>
          )}
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          {[["Название трека", title, setTitle], ["Исполнитель", artist, setArtist]].map(([ph, val, set]) => (
            <input key={ph as string} value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)}
              placeholder={ph as string}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} />
          ))}
          <select value={genre} onChange={(e) => setGenre(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(18,10,28,0.98)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {["DDLC OST", "Remix", "Lo-Fi", "Ambient", "Pop", "Synthwave", "Chillhop", "Acoustic", "Other"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {emojis.map((e) => (
            <button key={e} onClick={() => setEmoji(e)} className="w-9 h-9 rounded-xl text-xl transition-all"
              style={{ background: emoji === e ? t.primary + "33" : "rgba(255,255,255,0.05)",
                border: emoji === e ? `1px solid ${t.primary}77` : "1px solid transparent" }}>
              {e}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-5">
          {PAW_COLORS.map((c, i) => (
            <button key={c} onClick={() => setColorIdx(i)} className="w-8 h-8 rounded-full transition-all"
              style={{ background: c, boxShadow: colorIdx === i ? `0 0 12px ${c}` : "none",
                border: colorIdx === i ? "2px solid white" : "2px solid transparent" }} />
          ))}
        </div>

        {error && <div className="text-red-400 text-xs mb-3 text-center">{error}</div>}
        <button onClick={handleUpload} disabled={!file || loading}
          className="w-full py-3 rounded-2xl font-black text-white text-sm transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, boxShadow: `0 8px 24px ${t.glow}` }}>
          {loading ? "Загружаю... 🎵" : "Добавить трек 🎵"}
        </button>
      </div>
    </div>
  );
}

function PlayerPage({ track, isPlaying, progress, duration, onPlayPause, onNext, onPrev, onSeek, theme }: {
  track: Track; isPlaying: boolean; progress: number; duration: number;
  onPlayPause: () => void; onNext: () => void; onPrev: () => void; onSeek: (v: number) => void; theme: Theme;
}) {
  const t = THEMES[theme];
  const hasAudio = !!track.file_url;

  return (
    <div className="flex flex-col items-center gap-5 px-4 pt-6 pb-2 animate-fade-in">
      <div className="relative">
        <div className={`w-52 h-52 rounded-full overflow-hidden border-4 flex items-center justify-center ${isPlaying && hasAudio ? "animate-spin-slow" : ""}`}
          style={{ borderColor: track.color + "88", boxShadow: isPlaying ? `0 0 40px ${track.color}44` : "none" }}>
          <div className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: `radial-gradient(circle at 40% 40%, ${track.color}22, ${track.color}08)` }}>
            {track.cover_emoji}
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: `${t.primary}33`, border: `2px solid ${t.primary}66` }}>
          {hasAudio ? "🎧" : "🎵"}
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-white leading-tight">{track.title}</h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{track.artist}</p>
        <span className="text-xs px-3 py-0.5 rounded-full mt-2 inline-block"
          style={{ background: `${track.color}22`, color: track.color, border: `1px solid ${track.color}44` }}>
          {track.genre}
        </span>
      </div>

      <div className="w-full px-2">
        <div className="track-progress" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(((e.clientX - rect.left) / rect.width) * (duration || track.duration || 1));
        }}>
          <div className="track-progress-fill" style={{
            width: `${(progress / (duration || track.duration || 1)) * 100}%`,
            background: `linear-gradient(90deg, ${t.primary}, ${t.secondary})`,
          }} />
        </div>
        <div className="flex justify-between text-xs text-white/25 mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration || track.duration)}</span>
        </div>
      </div>

      {!hasAudio && (
        <div className="px-4 py-2.5 rounded-2xl text-xs text-center w-full"
          style={{ background: `${t.primary}08`, border: `1px dashed ${t.primary}33`, color: "rgba(255,255,255,0.35)" }}>
          Загрузи аудиофайл в Библиотеку для воспроизведения
        </div>
      )}

      <div className="flex items-center gap-4">
        <PawButton color={t.secondary} onClick={onPrev} size={48}>
          <Icon name="SkipBack" size={18} className="text-white" />
        </PawButton>
        <PawButton color={t.primary} onClick={onPlayPause} size={68}>
          <Icon name={isPlaying && hasAudio ? "Pause" : "Play"} size={28} className="text-white" />
        </PawButton>
        <PawButton color={t.secondary} onClick={onNext} size={48}>
          <Icon name="SkipForward" size={18} className="text-white" />
        </PawButton>
      </div>

      <div className="flex gap-3">
        <PawButton color={t.accent} size={36}><Icon name="Shuffle" size={14} className="text-white" /></PawButton>
        <PawButton color={t.secondary} size={36}><Icon name="Repeat" size={14} className="text-white" /></PawButton>
        <PawButton color={t.primary} size={36}><Icon name="Heart" size={14} className="text-white" /></PawButton>
        <PawButton color="#fb923c" size={36}><Icon name="Share2" size={14} className="text-white" /></PawButton>
      </div>
    </div>
  );
}

function LibraryPage({ userTracks, currentTrack, isPlaying, onPlay, onDelete, onUpload, loading, theme }: {
  userTracks: Track[]; currentTrack: Track; isPlaying: boolean;
  onPlay: (t: Track) => void; onDelete: (id: number) => void;
  onUpload: () => void; loading: boolean; theme: Theme;
}) {
  const t = THEMES[theme];
  const [filter, setFilter] = useState("Все");
  const allTracks = [...userTracks, ...DDLC_TRACKS];
  const genres = ["Все", "DDLC OST", ...Array.from(new Set(userTracks.map((tr) => tr.genre)))];
  const filtered = filter === "Все" ? allTracks : allTracks.filter((tr) => tr.genre === filter);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {genres.slice(0, 5).map((g) => (
            <button key={g} onClick={() => setFilter(g)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={filter === g
                ? { background: t.primary + "33", color: t.primary, border: `1px solid ${t.primary}55` }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {g}
            </button>
          ))}
        </div>
        <button onClick={onUpload}
          className="ml-1 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, boxShadow: `0 4px 16px ${t.glow}` }}>
          <Icon name="Plus" size={18} className="text-white" />
        </button>
      </div>

      {loading && <div className="text-center py-4 text-white/30 text-sm">Загрузка...</div>}

      {userTracks.length === 0 && !loading && (
        <div className="p-4 rounded-2xl text-center cursor-pointer hover:scale-[1.02] transition-transform"
          style={{ background: t.cardBg, border: `1px dashed ${t.primary}44` }}
          onClick={onUpload}>
          <div className="text-3xl mb-2">🎵</div>
          <div className="font-black text-white text-sm mb-0.5">Добавь свою музыку</div>
          <div className="text-xs text-white/30">MP3 · WAV · OGG · FLAC</div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((tr) => (
          <TrackCard key={tr.id} track={tr} isPlaying={isPlaying} isActive={currentTrack.id === tr.id}
            onPlay={() => onPlay(tr)} onDelete={tr.id > 0 ? () => onDelete(tr.id) : undefined} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ userTracks, theme }: { userTracks: Track[]; theme: Theme }) {
  const t = THEMES[theme];
  const isSprout = theme === "sprout";
  const avatar = isSprout ? SPROUT_URL : SAYORI_URL;

  const stats = [
    { label: "Загружено", value: String(userTracks.length), icon: "🎵" },
    { label: "DDLC треков", value: String(DDLC_TRACKS.length), icon: "📖" },
    { label: "Жанр", value: "DDLC", icon: isSprout ? "🌱" : "🌸" },
    { label: "Персонаж", value: isSprout ? "Sprout" : "Sayori", icon: isSprout ? "🍃" : "🎀" },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="p-6 flex flex-col items-center gap-4 rounded-2xl"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4"
            style={{ borderColor: t.primary + "77" }}>
            <img src={avatar} alt={isSprout ? "Sprout" : "Sayori"} className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 text-xl">{isSprout ? "🌱" : "🎀"}</div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black text-white">{isSprout ? "Funny Sprout" : "Digital Sayori"}</h2>
          <p className="text-xs mt-0.5" style={{ color: t.primary }}>{isSprout ? "Dandy's World 🍃" : "DDLC Literature Club 📖"}</p>
          <p className="text-xs mt-1 text-white/25 font-caveat text-base">
            {isSprout ? "Just existing and being green 🌿" : "Ehehe~ Just Monika... wait, no!"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="p-3 text-center rounded-2xl"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-sm font-black" style={{ color: t.primary }}>{s.value}</div>
            <div className="text-xs text-white/30 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <h3 className="font-black text-white mb-3 flex items-center gap-2">
          <span>📖</span> Саундтрек DDLC
        </h3>
        <div className="flex flex-col gap-1.5">
          {DDLC_TRACKS.slice(0, 6).map((tr, i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <span className="text-white/20 text-xs w-4">{i + 1}</span>
              <span className="text-base">{tr.cover_emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white/80 truncate">{tr.title}</div>
              </div>
              <span className="text-xs text-white/25">{formatTime(tr.duration)}</span>
            </div>
          ))}
          <div className="text-xs text-center mt-1" style={{ color: t.primary + "88" }}>
            + {DDLC_TRACKS.length - 6} треков в Библиотеке
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ theme, onThemeChange }: { theme: Theme; onThemeChange: (t: Theme) => void }) {
  const t = THEMES[theme];
  const [volume, setVolume] = useState(80);
  const [quality, setQuality] = useState("Высокое");

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="p-4 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="text-xs text-white/40 mb-3 font-bold uppercase tracking-wider">Тема оформления</div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(THEMES) as [Theme, typeof THEMES.sayori][]).map(([key, th]) => (
            <button key={key} onClick={() => onThemeChange(key)}
              className="p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
              style={{
                background: theme === key ? th.primary + "22" : "rgba(255,255,255,0.04)",
                border: `2px solid ${theme === key ? th.primary + "88" : "rgba(255,255,255,0.08)"}`,
              }}>
              <div className="text-2xl mb-2">{key === "sayori" ? "🌸" : "🌱"}</div>
              <div className="font-black text-white text-sm">{th.label}</div>
              <div className="text-xs text-white/30 mt-0.5">
                {key === "sayori" ? "DDLC · розово-фиолетовая" : "Dandy's World · зелёная"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🔊</span>
          <span className="text-sm font-bold text-white">Громкость: {volume}%</span>
        </div>
        <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full" style={{ accentColor: t.primary }} />
      </div>

      <div className="p-4 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🎧</span>
          <span className="text-sm font-bold text-white">Качество</span>
        </div>
        <div className="flex gap-2">
          {["Низкое", "Среднее", "Высокое"].map((q) => (
            <button key={q} onClick={() => setQuality(q)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={quality === q
                ? { background: t.primary + "33", color: t.primary, border: `1px solid ${t.primary}55` }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">📖</span>
          <span className="text-sm font-bold text-white">О приложении</span>
        </div>
        <p className="text-xs text-white/30">Digital Sayori Funnysprout</p>
        <p className="text-xs text-white/20 mt-0.5">Музыка: Dan Salvato — DDLC OST (CC BY-NC)</p>
        <p className="text-lg text-white/20 mt-1 font-caveat">Just Sayori & Sprout 💜🌱</p>
      </div>
    </div>
  );
}

function HomeHero({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 stars-bg animate-fade-in"
      style={{ background: "linear-gradient(135deg, #1a0a1e 0%, #2d0f2f 100%)" }}>
      <div className="relative mb-6">
        <div className="animate-float">
          <img src={SAYORI_URL} alt="Sayori"
            className="w-60 h-60 object-cover rounded-3xl"
            style={{ boxShadow: "0 0 60px rgba(244,114,182,0.5), 0 20px 60px rgba(0,0,0,0.5)", border: "2px solid rgba(244,114,182,0.35)" }} />
        </div>
        <div className="absolute -top-3 -right-4 animate-float" style={{ animationDelay: "0.5s" }}>
          <img src={SPROUT_URL} alt="Sprout"
            className="w-16 h-16 object-cover rounded-2xl"
            style={{ border: "2px solid rgba(74,222,128,0.5)", boxShadow: "0 0 20px rgba(74,222,128,0.4)" }} />
        </div>
        <div className="absolute -bottom-3 -left-3 text-3xl animate-float" style={{ animationDelay: "1s" }}>🌸</div>
        <div className="absolute top-6 -left-6 text-2xl animate-float" style={{ animationDelay: "1.5s" }}>🎵</div>
        <div className="absolute bottom-8 -right-6 text-xl animate-float" style={{ animationDelay: "0.8s" }}>📖</div>
      </div>

      <h1 className="text-3xl font-black text-center mb-1 leading-tight"
        style={{ background: "linear-gradient(135deg, #f472b6, #a78bfa, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Digital Sayori
      </h1>
      <h2 className="text-xl font-black text-center mb-2"
        style={{ background: "linear-gradient(135deg, #4ade80, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Funnysprout
      </h2>
      <p className="text-white/35 text-xs text-center mb-1">DDLC Literature Club · Dandy's World</p>
      <p className="text-white/20 text-center mb-6 font-caveat text-base">Sayori 🌸 & Funny Sprout 🌱</p>

      <div className="flex gap-3 mb-7">
        {[
          { color: "#f472b6", delay: "0s" },
          { color: "#a78bfa", delay: "0.15s" },
          { color: "#4ade80", delay: "0.3s" },
          { color: "#fbbf24", delay: "0.45s" },
          { color: "#60a5fa", delay: "0.6s" },
        ].map((p, i) => (
          <div key={i} className="animate-float" style={{ animationDelay: p.delay }}>
            <PawIcon color={p.color} size={26} />
          </div>
        ))}
      </div>

      <button onClick={onEnter}
        className="px-8 py-3 rounded-2xl font-black text-white text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #f472b6, #a78bfa)", boxShadow: "0 8px 32px rgba(244,114,182,0.4)" }}>
        🎵 Открыть плеер
      </button>
    </div>
  );
}

const NAV = [
  { id: "player", label: "Плеер", icon: "Music" },
  { id: "library", label: "Библиотека", icon: "Library" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

const Index = () => {
  const [showHome, setShowHome] = useState(true);
  const [activeTab, setActiveTab] = useState("player");
  const [theme, setTheme] = useState<Theme>("sayori");
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(DDLC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = THEMES[theme];
  const allTracks = [...userTracks, ...DDLC_TRACKS];

  const fetchTracks = useCallback(async () => {
    setLoadingTracks(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUserTracks(data.tracks || []);
    } catch { setUserTracks([]); }
    finally { setLoadingTracks(false); }
  }, []);

  useEffect(() => { fetchTracks(); }, [fetchTracks]);

  useEffect(() => {
    if (!currentTrack.file_url) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
      setIsPlaying(false); setProgress(0); return;
    }
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    if (audio.src !== currentTrack.file_url) {
      audio.src = currentTrack.file_url;
      audio.load();
      setProgress(0); setAudioDuration(0);
    }

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setAudioDuration(audio.duration || 0);
    const onEnd = () => handleNext();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentTrack, isPlaying]);

  const handleNext = () => {
    const idx = allTracks.findIndex((tr) => tr.id === currentTrack.id);
    const next = allTracks[(idx + 1) % allTracks.length];
    setCurrentTrack(next); setProgress(0);
    if (next.file_url) setIsPlaying(true);
  };

  const handlePrev = () => {
    if (progress > 3 && audioRef.current) { audioRef.current.currentTime = 0; setProgress(0); return; }
    const idx = allTracks.findIndex((tr) => tr.id === currentTrack.id);
    const prev = allTracks[(idx - 1 + allTracks.length) % allTracks.length];
    setCurrentTrack(prev); setProgress(0);
    if (prev.file_url) setIsPlaying(true);
  };

  const handlePlay = (track: Track) => {
    if (currentTrack.id === track.id) {
      if (track.file_url) setIsPlaying((p) => !p);
    } else {
      setCurrentTrack(track); setProgress(0);
      setIsPlaying(!!track.file_url);
    }
    setActiveTab("player");
  };

  const handleSeek = (v: number) => {
    setProgress(v);
    if (audioRef.current && currentTrack.file_url) audioRef.current.currentTime = v;
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    setUserTracks((prev) => prev.filter((tr) => tr.id !== id));
    if (currentTrack.id === id) { setCurrentTrack(DDLC_TRACKS[0]); setIsPlaying(false); }
  };

  const handleUploaded = (track: Track) => {
    setUserTracks((prev) => [track, ...prev]);
    setCurrentTrack(track); setIsPlaying(true);
    setActiveTab("player");
  };

  if (showHome) return <HomeHero onEnter={() => setShowHome(false)} />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto" style={{ background: t.bg }}>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} theme={theme} />}

      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${t.primary}22` }}>
        <button onClick={() => setShowHome(true)} className="flex items-center gap-2">
          {theme === "sprout" ? <SproutIcon size={26} /> : <PawIcon color={t.primary} size={24} />}
          <div>
            <span className="font-black text-sm block leading-tight"
              style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Digital Sayori
            </span>
            <span className="font-black text-xs block leading-tight"
              style={{ color: t.secondary + "cc" }}>
              Funnysprout
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {isPlaying && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primary }} />}
          <span className="text-white/25 text-xs truncate max-w-[100px]">{currentTrack.title}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "player" && (
          <PlayerPage track={currentTrack} isPlaying={isPlaying} progress={progress} duration={audioDuration}
            onPlayPause={() => { if (currentTrack.file_url) setIsPlaying((p) => !p); }}
            onNext={handleNext} onPrev={handlePrev} onSeek={handleSeek} theme={theme} />
        )}
        {activeTab === "library" && (
          <LibraryPage userTracks={userTracks} currentTrack={currentTrack} isPlaying={isPlaying}
            onPlay={handlePlay} onDelete={handleDelete} onUpload={() => setShowUpload(true)}
            loading={loadingTracks} theme={theme} />
        )}
        {activeTab === "profile" && <ProfilePage userTracks={userTracks} theme={theme} />}
        {activeTab === "settings" && <SettingsPage theme={theme} onThemeChange={setTheme} />}
      </div>

      <div className="flex items-center justify-around px-2 py-2 flex-shrink-0"
        style={{ borderTop: `1px solid ${t.primary}22`, background: "rgba(10,5,18,0.85)", backdropFilter: "blur(20px)" }}>
        {NAV.map((item) => (
          <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            style={activeTab === item.id ? { color: t.primary, background: t.primary + "18" } : {}}
            onClick={() => setActiveTab(item.id)}>
            <Icon name={item.icon as "Music"} size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Index;
