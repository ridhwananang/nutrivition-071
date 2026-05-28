import { ScanEye } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <ScanEye className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm select-none">
                <span className="truncate leading-tight font-black tracking-tight text-slate-800 dark:text-white uppercase italic">
                    Nutri<span className="text-amber-500">vision</span>
                </span>
            </div>
        </>
    );
}
