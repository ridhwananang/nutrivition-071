import React from 'react';
import { Utensils, Apple, Trash2 } from 'lucide-react';

interface ScanItem {
    id: number;
    scan_image: string | null;
    meal_type: string;
    serving_qty: number;
    confidence: number;
    total_calories: number;
    created_at?: string;
    analisis_ai?: string;
    nutrition?: {
        item: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

interface RecentScansProps {
    scans: ScanItem[];
    consumed: number;
    totalScans: number;
    onDelete: (id: number) => void;
}

export default function RecentScans({
    scans,
    consumed,
    totalScans,
    onDelete,
}: RecentScansProps) {
    const mealTypeColors = {
        breakfast:
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
        lunch: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
        dinner: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300',
        snack: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    };

    const mealLabels = {
        breakfast: 'Sarapan',
        lunch: 'Makan Siang',
        dinner: 'Makan Malam',
        snack: 'Cemilan',
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const month = months[date.getMonth()];
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day} ${month}, ${hours}:${minutes}`;
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            {/* Visual glowing frame background */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 opacity-30 blur-3xl dark:bg-amber-950/20"></div>

            <div>
                <div className="pb-6">
                    <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                        <span>Makanan Hari Ini</span>
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Makanan yang telah dipindai dan dikonsumsi pada hari
                        ini.
                    </p>
                </div>

                <div className="max-h-[300px] space-y-4 overflow-y-auto px-2">
                    {scans.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-2 py-10 text-center">
                            <div className="rounded-full border border-slate-100 bg-slate-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                                <Apple className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                                Belum ada makanan hari ini
                            </p>
                            <p className="max-w-[280px] text-[10px] font-semibold text-slate-400">
                                Gunakan panel sebelah kiri untuk memindai asupan
                                pertama Anda!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                            {scans.map((scan) => {
                                return (
                                    <div
                                        key={scan.id}
                                        className="group flex items-center justify-between gap-4 py-3.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Scan Image Thumbnail */}
                                            <div className="dark:border-neutral-850 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:bg-neutral-900">
                                                {scan.scan_image ? (
                                                    <img
                                                        src={`/storage/${scan.scan_image}`}
                                                        alt={
                                                            scan.nutrition
                                                                ?.item || 'Food'
                                                        }
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (
                                                                e.target as HTMLImageElement
                                                            ).src =
                                                                '/images/placeholder-food.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <Apple className="h-6 w-6 text-slate-300" />
                                                )}
                                            </div>

                                            {/* Food Name & Details */}
                                            <div className="space-y-1">
                                                <h4 className="text-sm leading-tight font-bold text-slate-800 dark:text-white">
                                                    {scan.nutrition?.item ||
                                                        'Makanan Tidak Dikenal'}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[9px] font-black tracking-wider uppercase ${mealTypeColors[scan.meal_type as keyof typeof mealTypeColors] || 'bg-slate-100 text-slate-700'}`}
                                                    >
                                                        {mealLabels[
                                                            scan.meal_type as keyof typeof mealLabels
                                                        ] || scan.meal_type}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400">
                                                        {scan.serving_qty} porsi
                                                    </span>
                                                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                                        {Math.round(
                                                            scan.confidence *
                                                                100,
                                                        )}
                                                        % AI
                                                    </span>
                                                    {scan.created_at && (
                                                        <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[9px] font-bold text-slate-550 border border-slate-100 dark:bg-neutral-900/50 dark:text-neutral-450 dark:border-neutral-800">
                                                            {formatDateTime(scan.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                {scan.nutrition && (
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                                                        <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-rose-600 dark:bg-red-950/30 dark:text-rose-400">
                                                            {Math.round(
                                                                scan.nutrition
                                                                    .calories *
                                                                    scan.serving_qty,
                                                            )}{' '}
                                                            kkal
                                                        </span>
                                                        <span className="rounded-md bg-orange-50 px-1.5 py-0.5 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                                                            P:{' '}
                                                            {Math.round(
                                                                scan.nutrition
                                                                    .protein *
                                                                    scan.serving_qty,
                                                            )}
                                                            g
                                                        </span>
                                                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                                            K:{' '}
                                                            {Math.round(
                                                                scan.nutrition
                                                                    .carbs *
                                                                    scan.serving_qty,
                                                            )}
                                                            g
                                                        </span>
                                                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-600 dark:bg-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                            L:{' '}
                                                            {Math.round(
                                                                scan.nutrition
                                                                    .fat *
                                                                    scan.serving_qty,
                                                            )}
                                                            g
                                                        </span>
                                                    </div>
                                                )}
                                                {scan.analisis_ai && (
                                                    <p className="mt-2.5 rounded-r-xl border-l-2 border-amber-500 bg-amber-500/5 py-1.5 pl-2.5 pr-2 text-[10px] font-semibold leading-relaxed italic text-slate-650 dark:text-neutral-350">
                                                        <strong className="mr-1 text-[8px] font-black tracking-wider text-amber-600 uppercase dark:text-amber-450">
                                                            Saran:
                                                        </strong>
                                                        {scan.analisis_ai}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDelete(scan.id)
                                                }
                                                className="text-slate-450 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                                                title="Hapus Makanan"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-black tracking-wider text-slate-500 uppercase dark:border-neutral-800">
                <span>
                    Scan Hari Ini:{' '}
                    <strong className="text-slate-800 dark:text-white">
                        {totalScans} Kali
                    </strong>
                </span>
            </div>
        </div>
    );
}
