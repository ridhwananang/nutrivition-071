import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import ApplicationLogo from '@/components/ApplicationLogo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props as any;

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-slate-100 dark:border-neutral-900 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Brand Logo */}
                    <Link
                        href="/"
                        className="group flex items-center"
                    >
                        <ApplicationLogo />
                    </Link>

                    {/* Right Side User Menu Content */}
                    <div className="ml-auto flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 rounded-2xl border border-amber-100 dark:border-amber-950/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 px-3 py-1.5 cursor-pointer transition select-none active:scale-95 duration-150">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white shadow-md shadow-amber-500/20">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:flex flex-col text-left">
                                        <span className="text-xs leading-none font-black text-slate-800 dark:text-white">
                                            {auth.user.name.split(' ')[0]}
                                        </span>
                                        <span className="mt-1 text-[9px] leading-none font-bold text-slate-400 dark:text-neutral-500">
                                            Sesi Aktif
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 hidden sm:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </nav>
        </>
    );
}
