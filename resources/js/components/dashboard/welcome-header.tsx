import { Sparkles } from 'lucide-react';

interface WelcomeHeaderProps {
    userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps) {
    return (
        <div className="dark:border-neutral-850 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                    <span>Halo, {userName.split(' ')[0]}!</span>
                </h1>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    Pindai makanan Anda, pantau asupan gizi harian Anda, dan
                    pertahankan pola hidup sehat secara cerdas.
                </p>
            </div>
        </div>
    );
}
