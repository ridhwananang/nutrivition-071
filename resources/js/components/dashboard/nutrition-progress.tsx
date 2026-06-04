import React from 'react';

interface Macro {
    value: number;
    goal: number;
    unit: string;
}

interface NutritionProgressProps {
    consumed: number;
    calorieGoal: number;
    macros:
        | {
              protein: Macro;
              carbs: Macro;
              fat: Macro;
          }
        | undefined;
}

export default function NutritionProgress({
    consumed,
    macros,
}: NutritionProgressProps) {
    const renderMacro = (
        name: string,
        value: number,
        unit: string,
        borderColorClass: string,
    ) => {
        return (
            <div className={`text-left border-l-4 ${borderColorClass} rounded-2xl bg-slate-50/50 p-4.5 dark:bg-neutral-900/30`}>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-neutral-500">
                    {name}
                </span>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">
                    {value} <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 lowercase">{unit}</span>
                </p>
            </div>
        );
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8 lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-950">
            {/* Visual glowing frame background */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 opacity-40 blur-3xl dark:bg-amber-950/20"></div>

            <div className="pb-6">
                <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                    <span>Total Asupan Nutrisi Hari Ini</span>
                </h3>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                    Akumulasi energi dan zat gizi dari makanan yang Anda konsumsi hari ini.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                {renderMacro(
                    'Kalori',
                    consumed,
                    'kkal',
                    'border-amber-500',
                )}
                {renderMacro(
                    'Protein',
                    macros?.protein?.value ?? 0,
                    'g',
                    'border-blue-500',
                )}
                {renderMacro(
                    'Karbohidrat',
                    macros?.carbs?.value ?? 0,
                    'g',
                    'border-purple-500',
                )}
                {renderMacro(
                    'Lemak',
                    macros?.fat?.value ?? 0,
                    'g',
                    'border-emerald-500',
                )}
            </div>
        </div>
    );
}
