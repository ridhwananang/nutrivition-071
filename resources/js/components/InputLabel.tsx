import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-black tracking-wider text-slate-500 dark:text-neutral-400 uppercase ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
