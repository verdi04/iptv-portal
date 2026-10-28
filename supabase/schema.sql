create table if not exists public.iptv_users (
  mac_address text primary key check (length(btrim(mac_address)) > 0),
  m3u_link text,
  xtream_url text,
  xtream_username text,
  xtream_password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
