import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AiDailyAdviceProps {
    advice?: string;
    isLoading?: boolean;
}

export default function AiDailyAdvice({
    advice,
    isLoading,
}: AiDailyAdviceProps) {
    return (
        <div className="relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-100/80 bg-white p-6 shadow-xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            {/* Visual glowing frame background */}
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100 opacity-30 blur-3xl dark:bg-amber-950/10"></div>
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-100 opacity-30 blur-3xl dark:bg-blue-950/10"></div>

            <div>
                <div className="pb-4">
                    <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                        <span>Saran Gizi Hari Ini</span>
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Rekomendasi harian yang dirangkum cerdas dari seluruh
                        scan makanan Anda.
                    </p>
                </div>

                <div className="pt-2 text-left">
                    {isLoading ? (
                        <div className="flex items-center gap-2 py-4 text-slate-400 dark:text-neutral-500">
                            <Loader2 className="h-4.5 w-4.5 animate-spin text-amber-500" />
                            <span className="animate-pulse text-xs font-bold tracking-widest uppercase">
                                Menghitung Saran AI...
                            </span>
                        </div>
                    ) : advice ? (
                        <div className="rounded-2xl border border-amber-100/50 bg-amber-50/10 p-4.5 text-xs leading-relaxed font-semibold text-slate-700 italic sm:text-sm dark:border-amber-950/20 dark:bg-amber-950/5 dark:text-neutral-300">
                            "{advice}"
                        </div>
                    ) : (
                        <div className="py-4 text-xs font-semibold text-slate-400 dark:text-neutral-500">
                            Belum ada saran untuk hari ini. Silakan pindai
                            hidangan makanan Anda terlebih dahulu.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
