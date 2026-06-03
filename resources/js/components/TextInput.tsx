import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    InputHTMLAttributes,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const inputElement = (
        <input
            {...props}
            type={inputType}
            className={
                'w-full rounded-2xl border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-3 text-sm dark:text-white shadow-xs focus:border-amber-500 focus:ring-amber-500 ' +
                (isPassword ? 'pr-12 ' : '') +
                className
            }
            ref={localRef}
        />
    );

    if (isPassword) {
        return (
            <div className="relative w-full">
                {inputElement}
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-2xl px-4 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
        );
    }

    return inputElement;
});
