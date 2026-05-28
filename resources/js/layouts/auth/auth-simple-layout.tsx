import { Link } from '@inertiajs/react';
import { ScanEye } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-[90vh] flex-col items-center justify-center bg-[#FCFCFC] dark:bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="relative w-full max-w-md space-y-6 sm:space-y-8 overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-neutral-900 p-5 sm:p-10 shadow-xl dark:shadow-neutral-950/40 transition-all">
                {/* Visual glowing frame background */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 dark:bg-amber-950/20 opacity-50 blur-2xl"></div>

                {/* Logo & Header */}
                <div className="space-y-3 text-center">
                    <Link
                        href={home()}
                        className="group inline-flex cursor-pointer justify-center transition hover:scale-105"
                    >
                        <div className="rounded-2xl bg-amber-500 p-2.5 shadow-lg shadow-amber-500/30">
                            <ScanEye className="h-6 w-6 text-white" />
                        </div>
                    </Link>
                    {title && (
                        <h2 className="pt-2 text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-white uppercase italic">
                            {title.split(' ')[0]} <span className="text-amber-500">{title.split(' ').slice(1).join(' ')}</span>
                        </h2>
                    )}
                    {description && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
