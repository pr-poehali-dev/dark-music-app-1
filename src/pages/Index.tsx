import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const FANART_URL =
  "https://cdn.poehali.dev/projects/f2dd484a-4610-4754-819a-8d1cb8c5e66b/files/05b07d0e-f6ae-4da7-bca1-2c85a5b6dce4.jpg";

const TRACKS = [
  { id: 1, title: "Baby Doll Remix Vol.1", artist: "NekoBeats Studio", album: "Baby Doll Collection", duration: 195, cover: "🎀", color: "#f472b6", genre: "Remix" },
  { id: 2, title: "Baby Doll Lo-Fi Mix", artist: "CaféCat Records", album: "Baby Doll Collection", duration: 212, cover: "🌸", color: "#a78bfa", genre: "Lo-Fi" },
  { id: 3, title: "Baby Doll Synthwave Edit", artist: "NeonPaws", album: "Baby Doll Collection", duration: 187, cover: "💜", color: "#60a5fa", genre: "Synthwave" },
  { id: 4, title: "Cat Café Morning", artist: "WhiskerTunes", album: "Cat Café Vibes", duration: 168, cover: "☕", color: "#34d399", genre: "Ambient" },
  { id: 5, title: "Meow Parade", artist: "WhiskerTunes", album: "Cat Café Vibes", duration: 143, cover: "🐱", color: "#fbbf24", genre: "Pop" },
  { id: 6, title: "Strawberry Milk Beats", artist: "CaféCat Records", album: "Cat Café Vibes", duration: 201, cover: "🍓", color: "#fb923c", genre: "Chillhop" },
  { id: 7, title: "Neko Dreams", artist: "NeonPaws", album: "Cat Café Vibes", duration: 178, cover: "🌙", color: "#f472b6", genre: "Dream Pop" },
  { id: 8, title: "Baby Doll Acoustic", artist: "SoftPaw Sessions", album: "Baby Doll Collection", duration: 224, cover: "🎸", color: "#a78bfa", genre: "Acoustic" },
];

const PLAYLISTS = [
  { id: 1, name: "Baby Doll Remixes", cover: "🎀", count: 4, color: "#f472b6" },
  { id: 2, name: "Cat Café Vibes", cover: "☕", count: 4, color: "#34d399" },
  { id: 3, name: "Избранное", cover: "💜", count: 3, color: "#a78bfa" },
];

const HISTORY = [1, 4, 2, 5, 3];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PawButton({ color, onClick, children, size = 52, className = "" }: {
  color: string; onClick?: () => void; children: React.ReactNode; size?: number; className?: string;
}) {
  return (
    <button
      className={`paw-btn ${className}`}
      onClick={onClick}
      style={{
        width: size, height: size,
        background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}66)`,
        boxShadow: `0 4px 20px ${color}55, inset 0 1px 0 ${color}99`,
      }}
    >
      {children}
    </button>
  );
}

function PawIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function TrackCard({ track, isPlaying, isActive, onPlay }: {
  track: typeof TRACKS[0]; isPlaying: boolean; isActive: boolean; onPlay: () => void;
}) {
  return (
    <div
      className={`glass-card p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${isActive ? "border-purple-400/40 bg-purple-500/10" : ""}`}
      onClick={onPlay}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `radial-gradient(circle, ${track.color}33, ${track.color}11)`, border: `1px solid ${track.color}44` }}>
        {track.cover}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate ${isActive ? "text-purple-300" : "text-white"}`}>{track.title}</div>
        <div className="text-xs text-white/40 truncate">{track.artist}</div>
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
      </div>
    </div>
  );
}

function PlayerPage({ track, isPlaying, progress, onPlayPause, onNext, onPrev, onProgressChange }: {
  track: typeof TRACKS[0]; isPlaying: boolean; progress: number;
  onPlayPause: () => void; onNext: () => void; onPrev: () => void; onProgressChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 pb-2 animate-fade-in">
      <div className="relative">
        <div className={`w-52 h-52 rounded-full overflow-hidden border-4 flex items-center justify-center ${isPlaying ? "animate-spin-slow" : ""}`}
          style={{ borderColor: track.color + "88" }}>
          <div className="w-full h-full flex items-center justify-center text-8xl"
            style={{ background: `radial-gradient(circle at 40% 40%, ${track.color}22, ${track.color}08)` }}>
            {track.cover}
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: `${track.color}33`, border: `2px solid ${track.color}66` }}>
          🎵
        </div>
        {isPlaying && (
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 40px ${track.color}44`, animation: "pulse-glow 2s ease-in-out infinite" }} />
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-white">{track.title}</h2>
        <p className="text-sm text-white/50 mt-1">{track.artist}</p>
        <span className="text-xs px-3 py-0.5 rounded-full mt-2 inline-block"
          style={{ background: `${track.color}22`, color: track.color, border: `1px solid ${track.color}44` }}>
          {track.genre}
        </span>
      </div>

      <div className="w-full px-2">
        <div className="track-progress" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onProgressChange(((e.clientX - rect.left) / rect.width) * track.duration);
        }}>
          <div className="track-progress-fill" style={{
            width: `${(progress / track.duration) * 100}%`,
            background: `linear-gradient(90deg, ${track.color}, #f472b6)`,
          }} />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PawButton color="#60a5fa" onClick={onPrev} size={48}>
          <Icon name="SkipBack" size={18} className="text-white" />
        </PawButton>
        <PawButton color={track.color} onClick={onPlayPause} size={68}>
          <Icon name={isPlaying ? "Pause" : "Play"} size={28} className="text-white" />
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

function LibraryPage({ tracks, currentTrack, isPlaying, onPlay }: {
  tracks: typeof TRACKS; currentTrack: typeof TRACKS[0]; isPlaying: boolean; onPlay: (t: typeof TRACKS[0]) => void;
}) {
  const [filter, setFilter] = useState("Все");
  const genres = ["Все", "Remix", "Lo-Fi", "Ambient", "Pop"];
  const filtered = filter === "Все" ? tracks : tracks.filter((t) => t.genre === filter);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {genres.map((g) => (
          <button key={g} onClick={() => setFilter(g)}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
            style={filter === g
              ? { background: "rgba(167,139,250,0.3)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.5)" }
              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {g}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((t) => (
          <TrackCard key={t.id} track={t} isPlaying={isPlaying} isActive={currentTrack.id === t.id} onPlay={() => onPlay(t)} />
        ))}
      </div>
    </div>
  );
}

function PlaylistsPage({ onPlay }: { onPlay: (t: typeof TRACKS[0]) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        {PLAYLISTS.map((pl) => (
          <div key={pl.id} className="glass-card p-4 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onPlay(TRACKS.find((tr) => tr.color === pl.color) || TRACKS[0])}>
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
          {TRACKS.slice(0, 3).map((t) => (
            <TrackCard key={t.id} track={t} isPlaying={false} isActive={false} onPlay={() => onPlay(t)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const stats = [
    { label: "Треков", value: "247", icon: "🎵" },
    { label: "Жанр", value: "Lo-Fi", icon: "💜" },
    { label: "Часов", value: "89", icon: "⏱️" },
    { label: "Плейлисты", value: "3", icon: "📋" },
  ];
  const history = HISTORY.map((id) => TRACKS.find((t) => t.id === id)!);

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
              <span className="text-lg">{t.cover}</span>
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
        <p className="text-base text-white/25 mt-1 font-caveat">Сайори & Спраут 💜</p>
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
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= currentTrack.duration) { handleNext(); return 0; }
          return p + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
    setCurrentTrack(TRACKS[(idx + 1) % TRACKS.length]);
    setProgress(0);
  };

  const handlePrev = () => {
    const idx = TRACKS.findIndex((t) => t.id === currentTrack.id);
    setCurrentTrack(TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]);
    setProgress(0);
  };

  const handlePlay = (track: typeof TRACKS[0]) => {
    if (currentTrack.id === track.id) { setIsPlaying((p) => !p); }
    else { setCurrentTrack(track); setProgress(0); setIsPlaying(true); }
    setActiveTab("player");
  };

  if (showHome) return <HomeHero onEnter={() => setShowHome(false)} />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto stars-bg">
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
          <PlayerPage track={currentTrack} isPlaying={isPlaying} progress={progress}
            onPlayPause={() => setIsPlaying((p) => !p)} onNext={handleNext} onPrev={handlePrev} onProgressChange={setProgress} />
        )}
        {activeTab === "library" && (
          <LibraryPage tracks={TRACKS} currentTrack={currentTrack} isPlaying={isPlaying} onPlay={handlePlay} />
        )}
        {activeTab === "playlists" && <PlaylistsPage onPlay={handlePlay} />}
        {activeTab === "profile" && <ProfilePage />}
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
