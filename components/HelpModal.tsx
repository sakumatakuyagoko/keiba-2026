"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        title: "① ログイン（初回のみ設定）",
        body: [
            "画面右上の人のアイコン（「ログイン」）を押します。",
            "自分の名前を選びます。初回は初期PIN「0000」なので、新しい4ケタの数字（PIN）を決めてください。",
            "2回目以降は、決めたPINを入力するだけです。馬名もここで変更できます。",
        ],
    },
    {
        title: "② 戦績を報告する",
        body: [
            "ログイン後、画面右下の黄色い「＋」ボタンを押します。",
            "開催場（京都／東京）とレース番号を選びます。発走前のレースは選べません。",
            "「投資額」（使った金額）と「回収額」（戻ってきた金額）を円で入力し、「報告する」を押します。外れたら回収額は0円です。",
        ],
    },
    {
        title: "③ 間違えたときは",
        body: [
            "ランキングの自分の名前を押すと戦績履歴が開きます。直したいレースを押すと修正できます。",
            "同じレースをもう一度報告すると、上書きされます。",
        ],
    },
    {
        title: "④ ランキングの見方",
        body: [
            "順位は「回収率（回収額 ÷ 投資額）」が高い順です。同じ場合は投資額が多い人が上になります。",
            "👑 は現在1位、⭐ は投資王（総投資額が最も多い人）です。",
            "金文字はプラス収支、白文字はマイナス収支です。",
            "右上の「歴代記録」で、過去の大会の成績や個人成績も見られます。",
        ],
    },
];

const FAQ = [
    { q: "PINを忘れた", a: "管理者（拓也さん）に連絡してリセットしてもらってください。" },
    { q: "レースが選べない", a: "発走時刻前のレースは入力できません。時刻を過ぎてから報告してください。" },
    { q: "「全投票締め切り」と出る", a: "管理者が投票を締め切ると、結果発表モードになります。" },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 text-white rounded-xl border border-white/10 shadow-2xl"
                        initial={{ y: 40 }}
                        animate={{ y: 0 }}
                        exit={{ y: 40 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 flex items-center justify-between bg-gray-900 px-5 py-3 border-b border-white/10">
                            <h2 className="font-bold text-2xl">📖 使い方</h2>
                            <button onClick={onClose} aria-label="閉じる" className="p-1 text-gray-400 hover:text-white">
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        <div className="p-5 space-y-6 text-lg leading-relaxed">
                            <p className="text-gray-300">
                                レースごとの投資額・回収額を報告して、みんなの回収率ランキングをリアルタイムで競うアプリです。
                            </p>

                            {STEPS.map((s) => (
                                <section key={s.title}>
                                    <h3 className="font-bold text-yellow-400 text-xl mb-2">{s.title}</h3>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-200">
                                        {s.body.map((b) => <li key={b}>{b}</li>)}
                                    </ul>
                                </section>
                            ))}

                            <section>
                                <h3 className="font-bold text-yellow-400 text-xl mb-2">よくある質問</h3>
                                <dl className="space-y-3">
                                    {FAQ.map((f) => (
                                        <div key={f.q}>
                                            <dt className="font-bold">Q. {f.q}</dt>
                                            <dd className="text-gray-300">A. {f.a}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>

                            <button onClick={onClose} className="w-full bg-white text-black font-bold py-3 text-lg rounded-lg hover:bg-gray-200">
                                閉じる
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
