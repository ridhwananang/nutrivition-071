import React from 'react';
import { Loader2, Upload, Camera, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import InputLabel from '@/components/InputLabel';

interface FoodScannerProps {
    scanForm: {
        data: {
            image: File | null;
            meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
            serving_qty: number;
        };
        setData: (field: string | any, value?: any) => void;
        processing: boolean;
        errors: {
            image?: string;
        };
    };
    imagePreview: string | null;
    setImagePreview: (val: string | null) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isCameraActive: boolean;
    startCamera: () => void;
    stopCamera: () => void;
    capturePhoto: () => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function FoodScanner({
    scanForm,
    imagePreview,
    setImagePreview,
    fileInputRef,
    videoRef,
    isCameraActive,
    startCamera,
    stopCamera,
    capturePhoto,
    handleImageChange,
    handleDragOver,
    handleDrop,
    onSubmit,
}: FoodScannerProps) {
    return (
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            {/* Visual glowing frame background */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 opacity-40 blur-3xl dark:bg-amber-950/20"></div>

            <div>
                <div className="pb-6">
                    <h3 className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                        <span>Pindai Makanan dengan AI</span>
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Unggah foto makanan Anda. AI akan mengidentifikasi gizi,
                        kalori, dan tipe makronutrisinya secara instan.
                    </p>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="space-y-4">
                        {/* Upload Dropzone / Camera Streaming Area */}
                        {isCameraActive ? (
                            <div className="relative flex min-h-[260px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-500 bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="h-60 w-full object-cover"
                                />
                                <div className="absolute right-0 bottom-4 left-0 z-30 flex justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            capturePhoto();
                                        }}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95"
                                    >
                                        <Camera className="h-4 w-4 text-white" />
                                        <span>Ambil Foto</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            stopCamera();
                                        }}
                                        className="hover:bg-slate-850 flex cursor-pointer items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition active:scale-95"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
                                    imagePreview
                                        ? 'border-amber-400 bg-amber-50/5 dark:bg-neutral-900/50'
                                        : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/5 dark:border-neutral-800 dark:hover:bg-neutral-900/10'
                                }`}
                            >
                                {imagePreview ? (
                                    <div className="relative flex h-40 w-full items-center justify-center">
                                        <img
                                            src={imagePreview}
                                            alt="Food Preview"
                                            className="z-10 h-full max-w-[85%] rounded-2xl object-contain transition-transform group-hover:scale-102"
                                        />
                                        {/* AI Scanning Bar Overlay */}
                                        {scanForm.processing && (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-black/40">
                                                <div
                                                    className="absolute right-0 left-0 h-1.5 w-full bg-amber-500 shadow-[0_0_12px_#f59e0b]"
                                                    style={{
                                                        animation:
                                                            'scan-animation 2.2s ease-in-out infinite',
                                                    }}
                                                />
                                                <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
                                                <span className="animate-pulse text-[10px] font-black tracking-widest text-white uppercase">
                                                    Analisis AI Berjalan...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="inline-block rounded-full border border-slate-100 bg-slate-50 p-3.5 shadow-xs transition-transform group-hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900">
                                            <Upload className="h-6 w-6 text-slate-500 dark:text-neutral-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-white">
                                                Tarik & lepas foto makanan di
                                                sini, atau klik untuk memilih
                                            </p>
                                            <p className="mt-1 text-[10px] font-semibold text-slate-400">
                                                Mendukung JPEG, PNG hingga 5 MB
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 pt-1">
                                            <div className="h-[1px] w-8 bg-slate-200 dark:bg-neutral-800" />
                                            <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">
                                                Atau
                                            </span>
                                            <div className="h-[1px] w-8 bg-slate-200 dark:bg-neutral-800" />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startCamera();
                                            }}
                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black tracking-wider text-white uppercase transition hover:bg-slate-800 active:scale-95"
                                        >
                                            <Camera className="h-3.5 w-3.5 animate-pulse text-amber-400" />
                                            <span>Gunakan Kamera</span>
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef as any}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-1.5 text-left">
                            <InputLabel
                                htmlFor="meal_type"
                                value="Waktu Makan"
                            />
                            <Select
                                value={scanForm.data.meal_type}
                                onValueChange={(val: any) =>
                                    scanForm.setData('meal_type', val)
                                }
                            >
                                <SelectTrigger className="cursor-pointer rounded-2xl border-slate-200 bg-white px-4 py-3 text-xs capitalize shadow-xs focus:border-amber-500 focus:ring-amber-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="breakfast"
                                        className="cursor-pointer"
                                    >
                                        Sarapan
                                    </SelectItem>
                                    <SelectItem
                                        value="lunch"
                                        className="cursor-pointer"
                                    >
                                        Makan Siang
                                    </SelectItem>
                                    <SelectItem
                                        value="dinner"
                                        className="cursor-pointer"
                                    >
                                        Makan Malam
                                    </SelectItem>
                                    <SelectItem
                                        value="snack"
                                        className="cursor-pointer"
                                    >
                                        Cemilan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="dark:border-neutral-855 mt-6 flex justify-between gap-4 border-t border-slate-100 pt-4">
                        {imagePreview && (
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreview(null);
                                    scanForm.setData('image', null);
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = '';
                                }}
                                className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-[10px] font-black tracking-wider uppercase transition hover:bg-slate-50"
                                disabled={scanForm.processing}
                            >
                                Reset Gambar
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={
                                scanForm.processing || !scanForm.data.image
                            }
                            className="ml-auto flex cursor-pointer items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-[10px] font-black tracking-wider text-white uppercase shadow-lg shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95 disabled:scale-100 disabled:opacity-50"
                        >
                            {scanForm.processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Menganalisis...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 fill-white text-white" />
                                    <span>Pindai Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
