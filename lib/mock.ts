import { User, Race, Bet } from "./types";

export const MOCK_USERS: User[] = [
    { id: "1", name: "ウグイスバレー", jockey: "原田", pin: "0000", color: "#ffffff" },
    { id: "2", name: "ニンゲンビレッジ", jockey: "矢橋", pin: "0000", color: "#000000" },
    { id: "3", name: "チェンジドライバ", jockey: "岡本", pin: "0000", color: "#ff0000" },
    { id: "4", name: "エセドバイオー", jockey: "安井", pin: "0000", color: "#0000ff" },
    { id: "5", name: "サイレントイナバ", jockey: "稲葉", pin: "0000", color: "#ffff00" },
    { id: "6", name: "ブームオレタ", jockey: "櫛部", pin: "0000", color: "#ffff00" },
    { id: "7", name: "ツチサカ", jockey: "土坂", pin: "0000", color: "#008000" },
    { id: "8", name: "イトウ", jockey: "伊藤", pin: "0000", color: "#008000" },
    { id: "9", name: "ハンケン", jockey: "冨田", pin: "0000", color: "#ffa500" },
    { id: "10", name: "アサミハズバンド", jockey: "大橋", pin: "0000", color: "#ffa500" },
    { id: "11", name: "オオクボハグルマ", jockey: "大久保", pin: "0000", color: "#ffc0cb" },
    { id: "12", name: "キンパチティーチャ", jockey: "佐久間", pin: "0000", color: "#ffc0cb" },
];

export const MOCK_RACES: Race[] = [
    // Tokyo
    { id: "t01", location: "Tokyo", raceNumber: 1, name: "3歳未勝利", conditions: "ダ1,400m", startTime: "10:05" },
    { id: "t02", location: "Tokyo", raceNumber: 2, name: "3歳未勝利", conditions: "ダ2,100m", startTime: "10:35" },
    { id: "t03", location: "Tokyo", raceNumber: 3, name: "3歳新馬", conditions: "ダ1,400m", startTime: "11:05" },
    { id: "t04", location: "Tokyo", raceNumber: 4, name: "3歳未勝利", conditions: "芝1,800m", startTime: "11:35" },
    { id: "t05", location: "Tokyo", raceNumber: 5, name: "3歳1勝クラス", conditions: "芝1,600m", startTime: "12:25" },
    { id: "t06", location: "Tokyo", raceNumber: 6, name: "4歳以上1勝クラス", conditions: "芝1,800m", startTime: "12:55" },
    { id: "t07", location: "Tokyo", raceNumber: 7, name: "4歳以上2勝クラス", conditions: "ダ2,100m", startTime: "13:25" },
    { id: "t08", location: "Tokyo", raceNumber: 8, name: "4歳以上2勝クラス", conditions: "芝1,400m", startTime: "13:55" },
    { id: "t09", location: "Tokyo", raceNumber: 9, name: "ヒヤシンスS (L)", conditions: "ダ1,600m", startTime: "14:25" },
    { id: "t10", location: "Tokyo", raceNumber: 10, name: "JC2025記念", conditions: "芝2,000m", startTime: "15:00" },
    { id: "t11", location: "Tokyo", raceNumber: 11, name: "フェブラリーS (G1)", conditions: "ダ1,600m", startTime: "15:40" },
    { id: "t12", location: "Tokyo", raceNumber: 12, name: "大島特別", conditions: "ダ1,400m", startTime: "16:25" },
    // Hanshin
    { id: "h01", location: "Hanshin", raceNumber: 1, name: "3歳未勝利", conditions: "ダ1,800m", startTime: "09:55" },
    { id: "h02", location: "Hanshin", raceNumber: 2, name: "3歳未勝利", conditions: "ダ1,200m", startTime: "10:25" },
    { id: "h03", location: "Hanshin", raceNumber: 3, name: "3歳未勝利", conditions: "ダ1,800m", startTime: "10:55" },
    { id: "h04", location: "Hanshin", raceNumber: 4, name: "3歳新馬", conditions: "ダ1,400m", startTime: "11:25" },
    { id: "h05", location: "Hanshin", raceNumber: 5, name: "3歳未勝利", conditions: "芝2,000m", startTime: "12:15" },
    { id: "h06", location: "Hanshin", raceNumber: 6, name: "3歳1勝クラス", conditions: "ダ1,400m", startTime: "12:45" },
    { id: "h07", location: "Hanshin", raceNumber: 7, name: "4歳以上1勝クラス", conditions: "芝2,400m", startTime: "13:15" },
    { id: "h08", location: "Hanshin", raceNumber: 8, name: "4歳以上1勝クラス", conditions: "ダ1,800m", startTime: "13:45" },
    { id: "h09", location: "Hanshin", raceNumber: 9, name: "天神橋特別", conditions: "芝1,600m", startTime: "14:15" },
    { id: "h10", location: "Hanshin", raceNumber: 10, name: "戎橋S", conditions: "芝1,400m", startTime: "14:50" },
    { id: "h11", location: "Hanshin", raceNumber: 11, name: "大和S", conditions: "ダ1,200m", startTime: "15:25" },
    { id: "h12", location: "Hanshin", raceNumber: 12, name: "4歳以上2勝クラス", conditions: "ダ1,400m", startTime: "16:10" },
    // Kokura
    { id: "k01", location: "Kokura", raceNumber: 1, name: "3歳未勝利", conditions: "ダ1,700m", startTime: "09:50" }, // Adjusted slightly from Tokyo start
    { id: "k02", location: "Kokura", raceNumber: 2, name: "3歳未勝利", conditions: "芝1,200m", startTime: "10:15" },
    { id: "k03", location: "Kokura", raceNumber: 3, name: "4歳以上1勝クラス", conditions: "ダ1,000m", startTime: "10:45" },
    { id: "k04", location: "Kokura", raceNumber: 4, name: "障害4歳以上未勝利", conditions: "芝2,860m", startTime: "11:15" },
    { id: "k05", location: "Kokura", raceNumber: 5, name: "3歳未勝利", conditions: "芝2,000m", startTime: "12:05" },
    { id: "k06", location: "Kokura", raceNumber: 6, name: "3歳未勝利", conditions: "芝1,800m", startTime: "12:35" },
    { id: "k07", location: "Kokura", raceNumber: 7, name: "4歳以上1勝クラス", conditions: "ダ1,700m", startTime: "13:05" },
    { id: "k08", location: "Kokura", raceNumber: 8, name: "4歳以上1勝クラス", conditions: "芝2,000m", startTime: "13:35" },
    { id: "k09", location: "Kokura", raceNumber: 9, name: "高千穂特別", conditions: "芝1,800m", startTime: "14:05" },
    { id: "k10", location: "Kokura", raceNumber: 10, name: "和布刈特別", conditions: "ダ1,700m", startTime: "14:40" },
    { id: "k11", location: "Kokura", raceNumber: 11, name: "小倉大賞典 (G3)", conditions: "芝1,800m", startTime: "15:15" },
    { id: "k12", location: "Kokura", raceNumber: 12, name: "4歳以上1勝クラス", conditions: "芝1,200m", startTime: "16:00" },
];

export const MOCK_BETS: Bet[] = [
    { id: "b1", userId: "3", raceId: "t11", investment: 10000, returnAmount: 20530, timestamp: new Date().toISOString() },
    { id: "b2", userId: "1", raceId: "t11", investment: 10000, returnAmount: 11900, timestamp: new Date().toISOString() },
    { id: "b3", userId: "2", raceId: "t11", investment: 10000, returnAmount: 3140, timestamp: new Date().toISOString() },
    { id: "b4", userId: "10", raceId: "k11", investment: 10000, returnAmount: 100, timestamp: new Date().toISOString() },
    { id: "b5", userId: "12", raceId: "h10", investment: 10000, returnAmount: 2420, timestamp: new Date().toISOString() },
];
