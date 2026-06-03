import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Apple,
    Flame,
    Droplet,
    Dumbbell,
    ShieldAlert,
} from 'lucide-react';

interface TipItem {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    bg: string;
    border: string;
    badgeText: string;
}

export default function AiHealthTips() {
    const [activeIndex, setActiveIndex] = useState(0);

    const tips: TipItem[] = [
        {
            title: 'Atur Defisit Kalori Secara Sehat & Cerdas',
            description:
                'Untuk menurunkan berat badan secara berkelanjutan, pertahankan defisit kalori moderat (300-500 kkal di bawah kebutuhan harian Anda). Hindari diet ekstrim agar massa otot tidak menyusut dan metabolisme tubuh tetap terjaga dengan baik.',
            icon: Flame,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-50/50 dark:bg-amber-950/20',
            border: 'border-amber-100 dark:border-amber-900/40',
            badgeText: 'Manajemen Energi',
        },
        {
            title: 'Penuhi Kebutuhan Protein Harian Anda',
            description:
                'Protein adalah makronutrisi krusial yang memberikan rasa kenyang lebih lama serta menjaga pemulihan otot setelah berolahraga. Usahakan mengonsumsi dada ayam panggang, telur, tahu, tempe, atau ikan dalam porsi makan utama Anda.',
            icon: Apple,
            color: 'text-blue-500 dark:text-blue-400',
            bg: 'bg-blue-50/50 dark:bg-blue-950/20',
            border: 'border-blue-100 dark:border-blue-900/40',
            badgeText: 'Nutrisi Otot',
        },
        {
            title: 'Optimalkan Hidrasi untuk Kontrol Nafsu Makan',
            description:
                'Seringkali rasa haus disalahartikan oleh otak sebagai rasa lapar. Minumlah segelas air putih hangat sekitar 15-20 menit sebelum makan. Hal ini terbukti efektif membantu mengendalikan porsi makan dan menjaga metabolisme sel tetap optimal.',
            icon: Droplet,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
            border: 'border-emerald-100 dark:border-emerald-900/40',
            badgeText: 'Hidrasi Tubuh',
        },
        {
            title: 'Tingkatkan Aktivitas Fisik Non-Olahraga (NEAT)',
            description:
                'Selain olahraga rutin di gym, pembakaran kalori harian terbesar dipengaruhi oleh NEAT (Non-Exercise Activity Thermogenesis). Pilihlah naik tangga dibanding lift, berjalan kaki saat menelepon, dan targetkan minimal 7.000 - 10.000 langkah per hari.',
            icon: Dumbbell,
            color: 'text-purple-500 dark:text-purple-400',
            bg: 'bg-purple-50/50 dark:bg-purple-950/20',
            border: 'border-purple-100 dark:border-purple-900/40',
            badgeText: 'Aktivitas Fisik',
        },
        {
            title: 'Terapkan Aturan Diet Fleksibel 80/20',
            description:
                'Diet terbaik adalah diet yang bisa Anda pertahankan dalam jangka panjang. Terapkan prinsip 80/20: penuhi 80% kebutuhan kalori Anda dari makanan utuh padat nutrisi, dan sisakan 20% untuk makanan favorit Anda agar kesehatan mental Anda tetap terjaga.',
            icon: ShieldAlert,
            color: 'text-rose-500 dark:text-rose-400',
            bg: 'bg-rose-50/50 dark:bg-rose-950/20',
            border: 'border-rose-100 dark:border-rose-900/40',
            badgeText: 'Konsistensi Diet',
        },
    ];

    // Auto rotate tips every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % tips.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [tips.length]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + tips.length) % tips.length);
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % tips.length);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl transition-all sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 opacity-30 blur-3xl dark:bg-amber-950/20"></div>

            {/* Header */}
            <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                        <span>Tips Hidup Sehat & Gizi Harian AI</span>
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Rekomendasi harian praktis untuk mendukung program diet
                        dan kebugaran Anda.
                    </p>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-2 select-none">
                    <button
                        onClick={handlePrev}
                        className="border-slate-150 text-slate-550 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-xs transition hover:bg-slate-50 hover:text-amber-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-amber-400"
                        title="Tips Sebelumnya"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="border-slate-150 text-slate-550 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border bg-white shadow-xs transition hover:bg-slate-50 hover:text-amber-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-amber-400"
                        title="Tips Berikutnya"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Tips Content Slide Area */}
            <div className="pt-2">
                <div className="w-full space-y-3 text-left">
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-md bg-amber-50 px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase dark:bg-amber-950/40 ${tips[activeIndex].color}`}
                        >
                            {tips[activeIndex].badgeText}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">
                            Rekomendasi Hari Ini
                        </span>
                    </div>
                    <h4 className="text-base leading-snug font-black tracking-tight text-slate-800 dark:text-white">
                        {tips[activeIndex].title}
                    </h4>
                    <p className="text-slate-650 dark:text-neutral-350 text-xs leading-relaxed font-medium">
                        {tips[activeIndex].description}
                    </p>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-2 pt-6">
                    {tips.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                                activeIndex === idx
                                    ? 'w-6 bg-amber-500'
                                    : 'hover:bg-slate-350 w-1.5 bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
