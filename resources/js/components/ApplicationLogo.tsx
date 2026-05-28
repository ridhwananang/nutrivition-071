import { ScanEye } from 'lucide-react';

interface ApplicationLogoProps {
    className?: string;
    iconClassName?: string;
}

export default function ApplicationLogo({
    className = '',
    iconClassName = 'w-6 h-6',
}: ApplicationLogoProps) {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <div className="rounded-2xl bg-amber-500 p-2 shadow-lg shadow-amber-500/30 transition-transform duration-300">
                <ScanEye className={`text-white ${iconClassName}`} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800 uppercase italic">
                NUTRI<span className="text-amber-500">VISION</span>
            </span>
        </div>
    );
}
