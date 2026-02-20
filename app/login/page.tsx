"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers, updateUserPin, updateUserName } from "@/lib/api";
import { User } from "@/lib/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import clsx from "clsx";
import { ArrowLeft, User as UserIcon, Lock, Edit2, LogOut } from "lucide-react";

// Fixed Order List (Should handle this centrally but simpler to copy for now or export)
const ORDERED_NAMES = [
    "ウグイスバレー", "ニンゲンビレッジ", "チェンジドライバ", "エセドバイオー",
    "サイレントイナバ", "ブームオレタ", "ツチサカ", "イトウ",
    "ハンケン", "アサミハズバンド", "オオクボハグルマ", "キンパチティーチャ"
];

export default function LoginPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    // Form State
    const [editName, setEditName] = useState("");
    const [pin, setPin] = useState("");
    const [newPin, setNewPin] = useState("");

    const [error, setError] = useState(false);
    const [mode, setMode] = useState<"login" | "register">("login");
    const [loading, setLoading] = useState(false);

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => { }, isAlert: false });

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchUsers();
            // Sort by ID to keep order constant
            const sorted = data.sort((a, b) => Number(a.id) - Number(b.id));
            setUsers(sorted);

            // Check current login
            const saved = localStorage.getItem('currentUser');
            if (saved) {
                const parsed = JSON.parse(saved);
                setCurrentUser(parsed);
                // Pre-select current user to allow editing immediately
                setSelectedUserId(parsed.id);
                setEditName(parsed.name);
                setMode("login");
            }
        };
        loadData();
    }, []);

    const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        setPin("");
        setNewPin("");
        setError(false);

        // If selecting a different user while logged in, warn? Or just switch context?
        // User requested: "If logged in, show current info."
        // But dropdown allows changing user implies "Switch User". 
        // We will allow selecting any user.

        const user = users.find(u => u.id === userId);
        if (user) {
            setEditName(user.name);
            if (user.pin === "0000") {
                setMode("register");
            } else {
                setMode("login");
            }
        }
    };

    const selectedUser = users.find(u => u.id === selectedUserId);

    const handleLogin = async () => {
        if (!selectedUser) return;

        setLoading(true);

        // Master Password Reset
        if (pin === "1155") {
            setModal({
                isOpen: true,
                title: "管理者機能（初期化）",
                message: "全ユーザーのパスワードを「0000」にリセットします。\n本当によろしいですか？",
                isAlert: false,
                onConfirm: async () => {
                    await Promise.all(users.map(u => updateUserPin(u.id, "0000")));
                    setModal({
                        isOpen: true,
                        title: "完了",
                        message: "パスワードのリセットが完了しました。",
                        isAlert: true,
                        onConfirm: () => {
                            window.location.reload();
                        }
                    });
                }
            });
            return;
        }

        if (pin === selectedUser.pin) {
            // Validate Name
            if (editName !== selectedUser.name) {
                if (!/^[ァ-ヶー]{2,9}$/.test(editName)) {
                    setModal({
                        isOpen: true,
                        title: "エラー",
                        message: "馬名は「カタカナ2〜9文字」で入力してください。",
                        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
                        isAlert: true
                    });
                    setLoading(false);
                    return;
                }
                await updateUserName(selectedUser.id, editName);
                selectedUser.name = editName;
            }
            localStorage.setItem('currentUser', JSON.stringify(selectedUser));
            setCurrentUser(selectedUser);
            router.push("/");
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
            setLoading(false);
        }
    };

    const handleRegister = () => {
        if (!selectedUser) return;

        // Validation
        if (!/^[ァ-ヶー]{2,9}$/.test(editName)) {
            setModal({
                isOpen: true,
                title: "エラー",
                message: "馬名は「カタカナ2〜9文字」で入力してください。",
                onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
                isAlert: true
            });
            return;
        }
        if (!/^\d{4}$/.test(newPin)) {
            setModal({
                isOpen: true,
                title: "エラー",
                message: "新しいパスワードは「数字4ケタ」で設定してください。",
                onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
                isAlert: true
            });
            return;
        }
        if (newPin === "0000") {
            setModal({
                isOpen: true,
                title: "エラー",
                message: "「0000」は使用不可です。\n他のパスワードを設定してください。",
                onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
                isAlert: true
            });
            return;
        }

        // Confirm
        setModal({
            isOpen: true,
            title: "登録確認",
            message: `馬名: ${editName}\nジョッキー: ${selectedUser.jockey}\nパスワード: ${newPin}\n\nこの内容で登録しますか？\n（パスワードを忘れないように！）`,
            isAlert: false,
            onConfirm: async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                await performRegister();
            }
        });
    };

    const performRegister = async () => {
        if (!selectedUser) return;
        setLoading(true);
        await Promise.all([
            updateUserPin(selectedUser.id, newPin),
            editName !== selectedUser.name ? updateUserName(selectedUser.id, editName) : Promise.resolve()
        ]);
        const updatedUser = { ...selectedUser, name: editName, pin: newPin };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

        // Alert Success
        /* User: "No specific request for success alert, just register" -> "Logged In state" */
        router.push("/");
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setSelectedUserId("");
        setPin("");
        setEditName("");
        setMode("login");
        router.refresh();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#004d25] text-white font-sans">
            <header className="bg-black/50 p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center">
                    <button onClick={() => router.push("/")} className="p-2 mr-4 bg-white/10 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-bold text-lg">ログイン / ユーザー情報</h1>
                </div>
                {currentUser && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 bg-red-600/80 hover:bg-red-600 text-xs font-bold px-3 py-2 rounded-lg"
                    >
                        <LogOut className="w-3 h-3" /> ログアウト
                    </button>
                )}
            </header>

            <div className="p-6 flex flex-col gap-6 max-w-md mx-auto w-full">

                {/* User Dropdown */}
                <div className="space-y-2">
                    <label className="text-sm text-yellow-500 font-bold">
                        {currentUser ? "現在のログインユーザー (変更可能)" : "1. ユーザー選択"}
                    </label>
                    <div className="relative">
                        <select
                            value={selectedUserId}
                            onChange={handleUserSelect}
                            className="w-full p-4 bg-white text-black border-4 border-black rounded-xl appearance-none font-bold text-lg outline-none shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                        >
                            <option value="">▼ 選択してください</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} 【{u.jockey}】
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedUser && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300 bg-black/20 p-6 rounded-2xl border border-white/10">

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm text-yellow-500 font-bold flex items-center gap-2">
                                馬名 <span className="text-xs text-white/70 font-normal">(変更可能)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-3 bg-white text-black font-bold rounded-lg border-2 border-transparent focus:border-yellow-500 outline-none"
                                />
                                <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Jockey */}
                        <div className="space-y-2">
                            <label className="text-sm text-yellow-500 font-bold">ジョッキー (苗字)</label>
                            <div className="p-3 bg-black/40 text-gray-300 font-bold rounded-lg border border-white/10">
                                {selectedUser.jockey}
                            </div>
                        </div>

                        {/* Password / Login */}
                        {mode === "login" ? (
                            <div className="space-y-2">
                                <label className="text-sm text-yellow-500 font-bold">パスワード</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className={clsx(
                                            "flex-1 p-3 bg-white text-black border-2 rounded-lg font-mono text-xl tracking-widest outline-none transition-colors",
                                            error ? "border-red-500 bg-red-50" : "border-transparent focus:border-yellow-500"
                                        )}
                                        placeholder="PIN"
                                    />
                                </div>
                                <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all text-xl"
                                >
                                    {loading ? "ログイン / 保存" : "ログイン / 保存"}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl space-y-4">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-yellow-500 shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-yellow-500">初回登録</h3>
                                        <p className="text-xs text-yellow-100/80 mt-1">
                                            本人確認のため、新しいパスワードを設定してください。
                                            <br /><span className="text-red-300 font-bold">※「0000」は使用不可</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-yellow-500 font-bold">新しいパスワード</label>
                                    <input
                                        type="text"
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value)}
                                        className="w-full p-3 bg-white text-black font-bold rounded-lg font-mono text-lg"
                                        placeholder="（半角数字4ケタ）"
                                    />
                                </div>

                                <button
                                    onClick={handleRegister}
                                    disabled={loading}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 rounded-lg shadow-lg active:scale-95 transition-all"
                                >
                                    {loading ? "登録中..." : "登録してログイン"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
                isAlert={modal.isAlert}
            />
        </div>
    );
}
