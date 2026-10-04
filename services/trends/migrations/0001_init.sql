PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS repositories (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  html_url TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS repo_aliases (
  name TEXT PRIMARY KEY COLLATE NOCASE,
  repo_id INTEGER NOT NULL REFERENCES repositories(id)
);
CREATE TABLE IF NOT EXISTS daily_snapshots (
  repo_id INTEGER NOT NULL REFERENCES repositories(id),
  date TEXT NOT NULL,
  stars INTEGER NOT NULL CHECK(stars >= 0),
  forks INTEGER NOT NULL CHECK(forks >= 0),
  last_commit_at TEXT,
  last_release_json TEXT,
  observed_at TEXT NOT NULL,
  PRIMARY KEY(repo_id, date)
);
CREATE TABLE IF NOT EXISTS metric_cache (
  repo_id INTEGER PRIMARY KEY REFERENCES repositories(id),
  payload TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  retry_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS collection_runs (
  run_key TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL,
  succeeded INTEGER NOT NULL,
  failed INTEGER NOT NULL
);
