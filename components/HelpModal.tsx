"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        title: "① ログイン",
        body: [
            "右上の人のアイコンを押し、自分の名前を選びます。",
            "初回は新しい4ケタのPINを決めます（初期PINは0000）。",
        ],
    },
    {
        title: "② 戦績を報告する",
        body: [
            "右下の黄色い「＋」を押します。",
            "開催場とレース番号を選び（発走前は選べません）、投資額と回収額を円で入力して「報告する」。外れは回収額0円です。",
            "※投資額は本人と管理者以外は見ることができません。",
        ],
    },
    {
        title: "③ 間違えたとき",
        body: [
            "ランキングの自分の名前を押し、直したいレースを選んで修正します。",
        ],
    },
    {
        title: "④ ランキングの見方",
        body: [
            "回収率（回収額 ÷ 投資額）の高い順です。",
            "👑 は1位、⭐ は投資王（総投資額が最多）です。",
            "金文字はプラス収支、白文字はマイナス収支です。",
            "「歴代記録」で過去の大会も見られます。",
        ],
    },
];

const FAQ = [
    { q: "PINを忘れた", a: "管理者（拓也さん）に連絡してください。" },
    { q: "レースが選べない", a: "発走時刻を過ぎてから報告してください。" },
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
