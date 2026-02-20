"use client";

import { useState } from "react";
import { resetBets, updateSystemStatus } from "@/lib/api";
import clsx from "clsx";

interface AdminControlsProps {
    isAdmin: boolean;
    onLogin: (password: string) => boolean | Promise<boolean>;
    onLogout: () => void;
    isBettingClosed?: boolean; // New prop
}

export function AdminControls({ isAdmin, onLogin, onLogout, isBettingClosed = false }: AdminControlsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleLogin = async () => {
        if (await onLogin(password)) {
            setPassword("");
            setError(false);
            setIsOpen(false); // Close modal on success if we want, or keep admin controls open
        } else {
            setError(true);
        }
    };

    const handleReset = async () => {
        if (confirm("本当にデータを初期化しますか？\nこれまでの投票データは全て消去されます。（ユーザーは消えません）")) {
            const { error } = await resetBets();
            if (error) {
                alert("初期化に失敗しました: " + error.message);
            } else {
                alert("データを初期化しました。");
                window.location.reload(); // Reload to refresh data
            }
        }
    };

    const handleToggleClose = async () => {
        const message = !isBettingClosed
            ? "全投票を締め切りますか？\n＊結果発表モードになります"
            : "通常モードに戻りますか？\n＊戦績結果・変更が可能となります";

        if (confirm(message)) {
            await updateSystemStatus(!isBettingClosed);
            // Parent page should listen to realtime or refresh, but we can rely on page reload or state update if implemented
            window.location.reload();
        }
    };

    if (isAdmin) {
        return (
            <div className="fixed bottom-4 left-4 right-20 z-40 flex flex-col gap-2 animate-in slide-in-from-bottom-4 pointer-events-none">
                <div className="bg-red-900/90 text-white p-4 rounded-xl border border-red-500 shadow-xl backdrop-blur-md pointer-events-auto max-w-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold flex items-center gap-2">
                            🔧 管理者モード中
                        </span>
                        <button
                            onClick={onLogout}
                            className="text-xs bg-black/30 hover:bg-black/50 px-3 py-1 rounded"
                        >
                            終了
                        </button>
                    </div>
                    <div className="text-xs text-red-200 mb-4">
                        ・全レースの投票ロックが解除されています<br />
                        ・「データ初期化」で練習データを消去できます
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-gray-800 rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => isBettingClosed && handleToggleClose()}
                                className={clsx(
                                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                                    !isBettingClosed
                                        ? "bg-green-600 text-white shadow-md"
                                        : "text-gray-400 hover:text-white"
                                )}
                            >
                                投票受付中
                            </button>
                            <button
                                onClick={() => !isBettingClosed && handleToggleClose()}
                                className={clsx(
                                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                                    isBettingClosed
                                        ? "bg-red-600 text-white shadow-md"
                                        : "text-gray-400 hover:text-white"
                                )}
                            >
                                ⛔ 締切 (結果)
                            </button>
                        </div>
                        <button
                            onClick={handleReset}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg shadow-sm text-sm"
                        >
                            ⚠️ 初期化
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40 pointer-events-none">
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto bg-gray-800/50 hover:bg-gray-800 text-white/30 hover:text-white text-xs px-4 py-1 rounded-full backdrop-blur-sm transition-all"
                >
                    Admin
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}>
                    <div
                        className="w-full max-w-sm bg-gray-900 p-6 rounded-xl border border-white/10 shadow-2xl space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-white font-bold text-lg">管理者ログイン</h3>
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={clsx(
                                    "w-full bg-black border rounded-lg p-3 text-white font-mono outline-none",
                                    error ? "border-red-500" : "border-white/20"
                                )}
                                placeholder="Password"
                            />
                            {error && <p className="text-red-500 text-xs">パスワードが違います</p>}
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200"
                        >
                            ログイン
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
