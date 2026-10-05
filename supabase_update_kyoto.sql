-- ===================================================
-- 鶯谷杯 京都2026 (2026/10/11) データベース更新・リセットSQL
-- Supabase の SQL Editor に貼り付けて「Run」を実行してください
-- ===================================================

-- 1. 前回のベット履歴を全クリア
DELETE FROM bets;

-- 2. 出場者7名の再登録（初期PINコード: 0000）
DELETE FROM users;

INSERT INTO users (name, jockey, pin) VALUES
('ウグイスバレー', '原田', '0000'),
('ニンゲンビレッジ', '矢橋', '0000'),
('キンパチティーチャ', '佐久間', '0000'),
('イトウ', '伊藤', '0000'),
('ハンケン', '冨田', '0000'),
('アサミハズバンド', '大橋', '0000'),
('ブームオレタ', '櫛部', '0000');

-- 3. レースマスタテーブルの作成とデータ登録（テーブルが存在しない場合は作成）
CREATE TABLE IF NOT EXISTS races (
  id text primary key,
  location text not null, -- 'Kyoto', 'Tokyo'
  race_number int not null,
  name text,
  conditions text,
  start_time text
);

-- 既存のレースデータをクリアして最新の京都・東京レースを登録
DELETE FROM races;

INSERT INTO races (id, location, race_number, name, conditions, start_time) VALUES
-- 京都（4回京都4日）
('k01', 'Kyoto', 1, '2歳未勝利', 'ダ1,200m', '09:50'),
('k02', 'Kyoto', 2, '2歳未勝利', '芝2,000m', '10:20'),
('k03', 'Kyoto', 3, '2歳新馬', 'ダ1,400m', '10:50'),
('k04', 'Kyoto', 4, '障害3歳以上未勝利', 'ダ2,910m', '11:20'),
('k05', 'Kyoto', 5, '2歳新馬', '芝2,000m', '12:10'),
('k06', 'Kyoto', 6, '3歳以上1勝クラス', 'ダ1,800m', '12:40'),
('k07', 'Kyoto', 7, '3歳以上1勝クラス', '芝1,600m', '13:10'),
('k08', 'Kyoto', 8, '3歳以上2勝クラス', 'ダ1,200m', '13:40'),
('k09', 'Kyoto', 9, '円山特別', 'ダ1,200m', '14:15'),
('k10', 'Kyoto', 10, '三年坂S', '芝1,600m', '14:50'),
('k11', 'Kyoto', 11, '太秦S (OP)', 'ダ1,800m', '15:25'),
('k12', 'Kyoto', 12, '3歳以上1勝クラス', 'ダ1,400m', '16:10'),
-- 東京（4回東京4日）
('t01', 'Tokyo', 1, '2歳未勝利', 'ダ1,600m', '10:05'),
('t02', 'Tokyo', 2, '2歳未勝利', '芝1,600m', '10:35'),
('t03', 'Tokyo', 3, '2歳未勝利', '芝2,000m', '11:05'),
('t04', 'Tokyo', 4, '2歳新馬', 'ダ1,600m', '11:35'),
('t05', 'Tokyo', 5, '2歳新馬', '芝2,000m', '12:25'),
('t06', 'Tokyo', 6, '3歳以上1勝クラス', 'ダ1,400m', '12:55'),
('t07', 'Tokyo', 7, '3歳以上1勝クラス', 'ダ1,600m', '13:25'),
('t08', 'Tokyo', 8, '3歳以上1勝クラス', '芝2,400m', '14:00'),
('t09', 'Tokyo', 9, '鷹巣山特別', '芝1,600m', '14:35'),
('t10', 'Tokyo', 10, 'テレビ静岡賞', 'ダ1,400m', '15:10'),
('t11', 'Tokyo', 11, 'アイルランドトロフィー (G2)', '芝1,800m', '15:45'),
('t12', 'Tokyo', 12, '3歳以上2勝クラス', 'ダ1,300m', '16:30');

-- 4. システム設定テーブル（締め切り状態の初期化：未締め切り）
CREATE TABLE IF NOT EXISTS system_settings (
  id int primary key default 1,
  is_betting_closed boolean default false,
  updated_at timestamp with time zone default now()
);

INSERT INTO system_settings (id, is_betting_closed)
VALUES (1, false)
ON CONFLICT (id) DO UPDATE SET is_betting_closed = false, updated_at = now();
