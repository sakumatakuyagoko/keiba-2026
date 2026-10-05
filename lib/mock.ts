import { User, Race, Bet } from "./types";

export const MOCK_USERS: User[] = [
    { id: "1", name: "ウグイスバレー", jockey: "原田", pin: "0000", color: "#ffffff" },
    { id: "2", name: "ニンゲンビレッジ", jockey: "矢橋", pin: "0000", color: "#000000" },
    { id: "3", name: "キンパチティーチャ", jockey: "佐久間", pin: "0000", color: "#ffc0cb" },
    { id: "4", name: "イトウ", jockey: "伊藤", pin: "0000", color: "#008000" },
    { id: "5", name: "ハンケン", jockey: "冨田", pin: "0000", color: "#ffa500" },
    { id: "6", name: "アサミハズバンド", jockey: "大橋", pin: "0000", color: "#ffa500" },
    { id: "7", name: "ブームオレタ", jockey: "櫛部", pin: "0000", color: "#ffff00" },
];

export const MOCK_RACES: Race[] = [
    // Kyoto (2026/10/11 4回京都4日)
    { id: "k01", location: "Kyoto", raceNumber: 1, name: "2歳未勝利", conditions: "ダ1,200m", startTime: "09:50" },
    { id: "k02", location: "Kyoto", raceNumber: 2, name: "2歳未勝利", conditions: "芝2,000m", startTime: "10:20" },
    { id: "k03", location: "Kyoto", raceNumber: 3, name: "2歳新馬", conditions: "ダ1,400m", startTime: "10:50" },
    { id: "k04", location: "Kyoto", raceNumber: 4, name: "障害3歳以上未勝利", conditions: "ダ2,910m", startTime: "11:20" },
    { id: "k05", location: "Kyoto", raceNumber: 5, name: "2歳新馬", conditions: "芝2,000m", startTime: "12:10" },
    { id: "k06", location: "Kyoto", raceNumber: 6, name: "3歳以上1勝クラス", conditions: "ダ1,800m", startTime: "12:40" },
    { id: "k07", location: "Kyoto", raceNumber: 7, name: "3歳以上1勝クラス", conditions: "芝1,600m", startTime: "13:10" },
    { id: "k08", location: "Kyoto", raceNumber: 8, name: "3歳以上2勝クラス", conditions: "ダ1,200m", startTime: "13:40" },
    { id: "k09", location: "Kyoto", raceNumber: 9, name: "円山特別", conditions: "ダ1,200m", startTime: "14:15" },
    { id: "k10", location: "Kyoto", raceNumber: 10, name: "三年坂S", conditions: "芝1,600m", startTime: "14:50" },
    { id: "k11", location: "Kyoto", raceNumber: 11, name: "太秦S (OP)", conditions: "ダ1,800m", startTime: "15:25" },
    { id: "k12", location: "Kyoto", raceNumber: 12, name: "3歳以上1勝クラス", conditions: "ダ1,400m", startTime: "16:10" },
    // Tokyo (2026/10/11 4回東京4日)
    { id: "t01", location: "Tokyo", raceNumber: 1, name: "2歳未勝利", conditions: "ダ1,600m", startTime: "10:05" },
    { id: "t02", location: "Tokyo", raceNumber: 2, name: "2歳未勝利", conditions: "芝1,600m", startTime: "10:35" },
    { id: "t03", location: "Tokyo", raceNumber: 3, name: "2歳未勝利", conditions: "芝2,000m", startTime: "11:05" },
    { id: "t04", location: "Tokyo", raceNumber: 4, name: "2歳新馬", conditions: "ダ1,600m", startTime: "11:35" },
    { id: "t05", location: "Tokyo", raceNumber: 5, name: "2歳新馬", conditions: "芝2,000m", startTime: "12:25" },
    { id: "t06", location: "Tokyo", raceNumber: 6, name: "3歳以上1勝クラス", conditions: "ダ1,400m", startTime: "12:55" },
    { id: "t07", location: "Tokyo", raceNumber: 7, name: "3歳以上1勝クラス", conditions: "ダ1,600m", startTime: "13:25" },
    { id: "t08", location: "Tokyo", raceNumber: 8, name: "3歳以上1勝クラス", conditions: "芝2,400m", startTime: "14:00" },
    { id: "t09", location: "Tokyo", raceNumber: 9, name: "鷹巣山特別", conditions: "芝1,600m", startTime: "14:35" },
    { id: "t10", location: "Tokyo", raceNumber: 10, name: "テレビ静岡賞", conditions: "ダ1,400m", startTime: "15:10" },
    { id: "t11", location: "Tokyo", raceNumber: 11, name: "アイルランドトロフィー (G2)", conditions: "芝1,800m", startTime: "15:45" },
    { id: "t12", location: "Tokyo", raceNumber: 12, name: "3歳以上2勝クラス", conditions: "ダ1,300m", startTime: "16:30" },
];

export const MOCK_BETS: Bet[] = [];
