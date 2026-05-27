CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL DEFAULT 'Неизвестный',
  genre VARCHAR(100) DEFAULT 'Other',
  duration INTEGER DEFAULT 0,
  file_url TEXT NOT NULL,
  cover_emoji VARCHAR(10) DEFAULT '🎵',
  color VARCHAR(20) DEFAULT '#a78bfa',
  created_at TIMESTAMP DEFAULT NOW()
);