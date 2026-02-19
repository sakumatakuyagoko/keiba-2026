-- Create tables for Horse Racing App

-- 1. Users (Riders/Horses)
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,     -- User/Horse Name
  jockey text not null,   -- Real Name
  pin text not null,      -- 4 digit PIN
  color text              -- Theme color (optional)
);

-- 2. Races (Master Data for 2026/02/22)
create table races (
  id uuid default gen_random_uuid() primary key,
  location text not null, -- 'Kokura', 'Tokyo', 'Hanshin'
  race_number int not null,
  name text,
  start_time timestamp with time zone
);

-- 3. Bets (Transactions)
create table bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) not null,
  race_id text not null, -- Can be UUID or string like 'kokura11'
  investment int default 0,
  return_amount int default 0,
  created_at timestamp with time zone default now()
);

-- 4. Enable Realtime
alter publication supabase_realtime add table bets;

-- 5. Seed Data (4th Uguisudani Cup)
insert into users (name, jockey, pin) values
('ウグイスバレー', '原田', '0000'),
('ニンゲンビレッジ', '矢橋', '0000'),
('チェンジドライバ', '岡本', '0000'),
('エセドバイオー', '安井', '0000'),
('サイレントイナバ', '稲葉', '0000'),
('ブームオレタ', '櫛部', '0000'),
('ツチサカ', '土坂', '0000'),
('イトウ', '伊藤', '0000'),
('ハンケン', '富田', '0000'),
('アサミハズバンド', '大橋', '0000'),
('オオクボハグルマ', '大久保', '0000'),
('キンパチティーチャ', '佐久間', '0000');
