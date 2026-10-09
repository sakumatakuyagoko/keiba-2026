-- ===================================================
-- 鶯谷杯アプリ 追加機能用 データベース更新SQL
-- Supabase の SQL Editor に貼り付けて「Run」を実行してください（何度実行しても安全です）
-- ===================================================

-- 1. 出場者の並び順（管理者画面の ▲▼ ボタン用）
ALTER TABLE users ADD COLUMN IF NOT EXISTS sort_order int;

UPDATE users SET sort_order = CASE jockey
  WHEN '原田' THEN 0 WHEN '矢橋' THEN 1 WHEN '佐久間' THEN 2 WHEN '伊藤' THEN 3
  WHEN '冨田' THEN 4 WHEN '富田' THEN 4 WHEN '大橋' THEN 5 WHEN '櫛部' THEN 6
  ELSE 99 END
WHERE sort_order IS NULL;

-- 2. 大会結果の保存テーブル（投票を締め切ったときに自動保存 → 歴代記録に反映）
CREATE TABLE IF NOT EXISTS tournament_archives (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE tournament_archives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read tournament_archives" ON tournament_archives;
CREATE POLICY "public read tournament_archives" ON tournament_archives FOR SELECT USING (true);
DROP POLICY IF EXISTS "public insert tournament_archives" ON tournament_archives;
CREATE POLICY "public insert tournament_archives" ON tournament_archives FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "public update tournament_archives" ON tournament_archives;
CREATE POLICY "public update tournament_archives" ON tournament_archives FOR UPDATE USING (true);

-- 3. 出場者の追加・削除・並び替えを他の人の画面にも即時反映（既に有効ならエラーになりますが無視してOK）
ALTER PUBLICATION supabase_realtime ADD TABLE users;
