import { Head, usePage, useHttp } from '@inertiajs/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Loader2, Upload, Apple, Trash2, 
    Sparkles, TrendingUp, Utensils, Camera
} from 'lucide-react';
import Api from '@/actions/App/Http/Controllers/Api';
import { dashboard } from '@/routes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import InputLabel from '@/components/InputLabel';

interface Macro {
    value: number;
    goal: number;
    unit: string;
}

interface DashboardData {
    date: string;
    calorie_goal: number;
    calorie_left: number;
    summary: {
        total_calories: number;
        total_protein: number;
        total_carbs: number;
        total_fat: number;
        total_fiber: number;
        scan_count: number;
    };
    recent_scans: any[];
    macros: {
        protein: Macro;
        carbs: Macro;
        fat: Macro;
    };
}

interface WeeklyDayData {
    date: string;
    day: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    scan_count: number;
}

export default function Dashboard() {
    const { auth } = usePage().props as { auth: { user: { name: string; email: string } } };
    const { submit } = useHttp();

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyDayData[]>([]);
    
    // Scanner Upload State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Camera Integration States & Refs
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Form Hook for Scan
    const scanForm = useHttp({
        image: null as File | null,
        meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        serving_qty: 1,
    });

    // Fetch All Data
    const loadDashboardData = useCallback(async () => {
        try {
            // Load dashboard stats
            const dashRes = await submit(Api.DashboardController.index()) as { data: DashboardData };
            setDashboardData(dashRes.data);

            // Load 7-day weekly stats
            const statsRes = await submit(Api.StatsController.weekly()) as { data: WeeklyDayData[] };
            setWeeklyStats(statsRes.data);
        } catch (e) {
            console.error('Failed to load dashboard data:', e);
            toast.error('Gagal memuat data dashboard.');
        } finally {
            setIsLoading(false);
        }
    }, [submit]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);


    // Handle Image upload selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file gambar maksimal 5 MB.");
                return;
            }
            scanForm.setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file gambar maksimal 5 MB.");
                return;
            }
            scanForm.setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // WebRTC Camera Handlers
    const startCamera = async () => {
        try {
            setIsCameraActive(true);
            setImagePreview(null);
            scanForm.setData('image', null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' },
                audio: false 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Gagal mengakses kamera:", err);
            toast.error("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        scanForm.setData('image', file);
                        setImagePreview(URL.createObjectURL(file));
                        stopCamera();
                        toast.success("Foto berhasil diambil!");
                    }
                }, 'image/jpeg', 0.85);
            }
        }
    };

    // Trigger AI Scan
    const handleScanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanForm.data.image) {
            toast.error("Silakan unggah foto makanan terlebih dahulu.");
            return;
        }

        try {
            const res = await scanForm.submit(Api.ScanController.store()) as { status: string; data: any };
            if (res.status === 'success') {
                toast.success(`Berhasil mendeteksi ${res.data.nutrition.item}! Gizi ditambahkan.`);
                // Reset form preview and data
                setImagePreview(null);
                scanForm.setData({
                    image: null,
                    meal_type: 'breakfast',
                    serving_qty: 1,
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
                // Reload dashboard data dynamically
                loadDashboardData();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(scanForm.errors.image || "Gagal memindai gambar makanan. Coba lagi.");
        }
    };

    // Reset/Hapus Scan Item
    const handleResetScan = async (scanId: number) => {
        try {
            toast.promise(
                submit(Api.ScanController.reset({ id: scanId })),
                {
                    loading: 'Menghapus data gizi...',
                    success: () => {
                        loadDashboardData();
                        return 'Data gizi berhasil dihapus!';
                    },
                    error: 'Gagal menghapus data gizi.',
                }
            );
        } catch (e) {
            console.error(e);
        }
    };

    // Total Calories Consumed
    const consumed = dashboardData?.summary?.total_calories ?? 0;

    // Macro rendering helper
    const renderMacro = (name: string, macro: Macro | undefined, colorClass: string, bgClass: string) => {
        if (!macro) return null;
        const percent = Math.min((macro.value / macro.goal) * 100, 100);
        return (
            <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <span>{name}</span>
                    <span>
                        <strong className="text-slate-800 dark:text-white font-black">{macro.value}</strong> / {macro.goal} {macro.unit}
                    </span>
                </div>
                <div className="h-2.5 w-full bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        );
    };

    // Max calories scaling for custom SVG chart
    const maxCalories = Math.max(...weeklyStats.map(d => d.total_calories), 2000);

    if (isLoading && !dashboardData) {
        return (
            <div className="flex flex-col gap-6 p-6 h-full flex-1 justify-center items-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-widest animate-pulse">Menyelaraskan data gizi Nutrivision...</span>
            </div>
        );
    }

    return (
        <>
            <Head title="Dashboard - Nutrivision" />

            {/* Custom Scan Keyframe animation stylesheet */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan-animation {
                    0%, 100% { top: 0%; opacity: 0.8; }
                    50% { top: 100%; opacity: 0.3; }
                }
            `}} />

            <div className="flex flex-col gap-6 p-6 overflow-x-auto rounded-xl max-w-7xl mx-auto w-full">
                
                {/* Header Welcome */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-neutral-850 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white uppercase italic flex items-center gap-2">
                            <span>Halo, {auth.user.name.split(' ')[0]}!</span>
                            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-1">
                            Pindai makanan Anda, pantau asupan gizi harian Anda, dan pertahankan pola hidup sehat secara cerdas.
                        </p>
                    </div>
                    {/* Active AI badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 dark:border-amber-950/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-2 self-start sm:self-center">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                        <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                            ASISTEN AI AKTIF
                        </span>
                    </div>
                </div>

                {/* Row 1: Summary ring and macros */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Macros Progress Card */}
                    <div className="lg:col-span-3 shadow-xl relative overflow-hidden rounded-[2.5rem] border border-slate-100/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8">
                        {/* Visual glowing frame background */}
                        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 dark:bg-amber-950/20 opacity-40 blur-3xl"></div>
                        
                        <div className="pb-6">
                            <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic">
                                <Apple className="w-5 h-5 text-amber-500 fill-amber-500 inline-block mr-2 align-middle" />
                                <span className="align-middle">Keseimbangan Nutrisi Harian</span>
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-1">Capaian nutrisi dan energi makanan Anda hari ini.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-5">
                                {renderMacro('Kalori Harian', { value: consumed, goal: dashboardData?.calorie_goal ?? 2000, unit: 'kkal' }, 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-md shadow-amber-500/20', 'bg-amber-100')}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div>
                                    {renderMacro('Protein', dashboardData?.macros.protein, 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-md shadow-blue-500/20', 'bg-blue-100')}
                                </div>
                                <div>
                                    {renderMacro('Karbohidrat', dashboardData?.macros.carbs, 'bg-gradient-to-r from-purple-400 to-purple-600 shadow-md shadow-purple-500/20', 'bg-purple-100')}
                                </div>
                                <div>
                                    {renderMacro('Lemak', dashboardData?.macros.fat, 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20', 'bg-emerald-100')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Scan AI Form and Recent Scans list */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scanner Upload Form */}
                    <div className="shadow-xl border border-slate-100 dark:border-neutral-800 rounded-[2.5rem] bg-white dark:bg-neutral-950 overflow-hidden relative p-6 sm:p-8 flex flex-col justify-between">
                        {/* Visual glowing frame background */}
                        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 dark:bg-amber-950/20 opacity-40 blur-3xl"></div>
                        
                        <div>
                            <div className="pb-6">
                                <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                                    <span>Pindai Makanan dengan AI</span>
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-1">
                                    Unggah foto makanan Anda. AI akan mengidentifikasi gizi, kalori, dan tipe makronutrisinya secara instan.
                                </p>
                            </div>
                            
                            <form onSubmit={handleScanSubmit}>
                                <div className="space-y-4">
                                    {/* Upload Dropzone / Camera Streaming Area */}
                                    {isCameraActive ? (
                                        <div className="relative w-full rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center min-h-[260px] border-2 border-amber-500">
                                            <video 
                                                ref={videoRef} 
                                                autoPlay 
                                                playsInline 
                                                className="w-full h-60 object-cover"
                                            />
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30">
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        capturePhoto();
                                                    }}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs tracking-wider uppercase rounded-2xl px-5 py-2.5 shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                                                >
                                                    <Camera className="w-4 h-4 text-white" />
                                                    <span>Ambil Foto</span>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        stopCamera();
                                                    }}
                                                    className="bg-slate-900 hover:bg-slate-850 text-white font-black text-xs tracking-wider uppercase rounded-2xl px-5 py-2.5 shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
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
                                            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group ${
                                                imagePreview 
                                                    ? 'border-amber-400 bg-amber-50/5 dark:bg-neutral-900/50' 
                                                    : 'border-slate-200 hover:border-amber-400 dark:border-neutral-800 hover:bg-amber-50/5 dark:hover:bg-neutral-900/10'
                                            }`}
                                        >
                                            {imagePreview ? (
                                                <div className="relative w-full h-40 flex items-center justify-center">
                                                    <img 
                                                        src={imagePreview} 
                                                        alt="Food Preview" 
                                                        className="h-full rounded-2xl object-contain max-w-[85%] z-10 transition-transform group-hover:scale-102"
                                                    />
                                                    {/* AI Scanning Bar Overlay */}
                                                    {scanForm.processing && (
                                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-2xl z-20">
                                                            <div 
                                                                className="absolute left-0 right-0 h-1.5 bg-amber-500 shadow-[0_0_12px_#f59e0b] w-full"
                                                                style={{
                                                                    animation: 'scan-animation 2.2s ease-in-out infinite',
                                                                }}
                                                            />
                                                            <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                                                            <span className="text-[10px] font-black text-white tracking-widest uppercase animate-pulse">Analisis AI Berjalan...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3 flex flex-col items-center">
                                                    <div className="p-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-full inline-block group-hover:scale-105 transition-transform shadow-xs">
                                                        <Upload className="w-6 h-6 text-slate-500 dark:text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 dark:text-white">Tarik & lepas foto makanan di sini, atau klik untuk memilih</p>
                                                        <p className="text-[10px] font-semibold text-slate-400 mt-1">Mendukung JPEG, PNG hingga 5 MB</p>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-center gap-2 pt-1">
                                                        <div className="h-[1px] w-8 bg-slate-200 dark:bg-neutral-800" />
                                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Atau</span>
                                                        <div className="h-[1px] w-8 bg-slate-200 dark:bg-neutral-800" />
                                                    </div>
     
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startCamera();
                                                        }}
                                                        className="text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 bg-slate-900 text-white rounded-xl px-4 py-2 hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                                                    >
                                                        <Camera className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                                        <span>Gunakan Kamera</span>
                                                    </button>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                    )}
     
                                    {/* Form Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <InputLabel htmlFor="meal_type" value="Waktu Makan" />
                                            <Select 
                                                value={scanForm.data.meal_type} 
                                                onValueChange={(val: any) => scanForm.setData('meal_type', val)}
                                            >
                                                <SelectTrigger className="capitalize text-xs cursor-pointer rounded-2xl py-3 px-4 border-slate-200 bg-white shadow-xs focus:ring-amber-500 focus:border-amber-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="breakfast" className="cursor-pointer">Sarapan</SelectItem>
                                                    <SelectItem value="lunch" className="cursor-pointer">Makan Siang</SelectItem>
                                                    <SelectItem value="dinner" className="cursor-pointer">Makan Malam</SelectItem>
                                                    <SelectItem value="snack" className="cursor-pointer">Cemilan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div className="space-y-1.5 text-left">
                                            <InputLabel htmlFor="serving_qty" value="Jumlah Porsi" />
                                            <Input 
                                                id="serving_qty"
                                                type="number"
                                                min="0.1"
                                                step="0.1"
                                                value={scanForm.data.serving_qty}
                                                onChange={(e) => scanForm.setData('serving_qty', parseFloat(e.target.value) || 1)}
                                                className="text-xs font-bold rounded-2xl py-3 px-4 border-slate-200 bg-white shadow-xs focus:ring-amber-500 focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-neutral-850 mt-6 pt-4 flex justify-between gap-4">
                                    {imagePreview && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setImagePreview(null);
                                                scanForm.setData('image', null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="text-[10px] font-black tracking-wider uppercase border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 transition cursor-pointer"
                                            disabled={scanForm.processing}
                                        >
                                            Reset Gambar
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        disabled={scanForm.processing || !scanForm.data.image}
                                        className="ml-auto text-[10px] font-black tracking-wider uppercase shadow-lg shadow-amber-500/20 bg-amber-500 text-white rounded-2xl px-6 py-3.5 hover:bg-amber-600 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2 cursor-pointer transition"
                                    >
                                        {scanForm.processing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menganalisis...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 text-white fill-white" />
                                                <span>Pindai Sekarang</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Recent Food Scans List */}
                    <div className="shadow-xl border border-slate-100 dark:border-neutral-800 rounded-[2.5rem] bg-white dark:bg-neutral-950 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden">
                        {/* Visual glowing frame background */}
                        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 dark:bg-amber-950/20 opacity-30 blur-3xl"></div>
                        
                        <div>
                            <div className="pb-6">
                                <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-amber-500" />
                                    <span>Makanan Hari Ini</span>
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-1">Makanan yang telah dipindai dan dikonsumsi pada hari ini.</p>
                            </div>
                            
                            <div className="overflow-y-auto max-h-[300px] space-y-4 px-2">
                                {dashboardData?.recent_scans.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2">
                                        <div className="p-3.5 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-full">
                                            <Apple className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">Belum ada makanan hari ini</p>
                                        <p className="text-[10px] font-semibold text-slate-400 max-w-[280px]">Gunakan panel sebelah kiri untuk memindai asupan pertama Anda!</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-105 dark:divide-neutral-800">
                                        {dashboardData?.recent_scans.map((scan) => {
                                            const mealTypeColors = {
                                                breakfast: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
                                                lunch: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
                                                dinner: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300',
                                                snack: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                                            };
                                            const mealLabels = {
                                                breakfast: 'Sarapan',
                                                lunch: 'Makan Siang',
                                                dinner: 'Makan Malam',
                                                snack: 'Cemilan'
                                            };

                                            return (
                                                <div key={scan.id} className="flex items-center justify-between py-3.5 gap-4 group">
                                                    <div className="flex items-center gap-3">
                                                        {/* Scan Image Thumbnail */}
                                                        <div className="w-12 h-12 bg-slate-50 dark:bg-neutral-900 rounded-xl overflow-hidden border border-slate-100 dark:border-neutral-850 flex-shrink-0 flex items-center justify-center">
                                                            {scan.scan_image ? (
                                                                <img 
                                                                    src={`/storage/${scan.scan_image}`} 
                                                                    alt={scan.nutrition?.item || 'Food'} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '/images/placeholder-food.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Apple className="w-6 h-6 text-slate-300" />
                                                            )}
                                                        </div>
                                                        
                                                        {/* Food Name & Details */}
                                                        <div className="space-y-1">
                                                            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                                                                {scan.nutrition?.item || 'Makanan Tidak Dikenal'}
                                                            </h4>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`text-[9px] py-0.5 px-2 font-black uppercase tracking-wider rounded-md ${mealTypeColors[scan.meal_type as keyof typeof mealTypeColors] || 'bg-slate-100 text-slate-700'}`}>
                                                                    {mealLabels[scan.meal_type as keyof typeof mealLabels] || scan.meal_type}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 font-bold">
                                                                    {scan.serving_qty} porsi
                                                                </span>
                                                                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                                                    {Math.round(scan.confidence * 100)}% AI
                                                                </span>
                                                            </div>
                                                            {scan.nutrition && (
                                                                <div className="flex items-center gap-1.5 text-[9px] font-bold mt-1.5 flex-wrap">
                                                                    <span className="bg-red-50 dark:bg-red-950/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md">
                                                                        {Math.round(scan.nutrition.calories * scan.serving_qty)} kkal
                                                                    </span>
                                                                    <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md">
                                                                        P: {Math.round(scan.nutrition.protein * scan.serving_qty)}g
                                                                    </span>
                                                                    <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
                                                                        K: {Math.round(scan.nutrition.carbs * scan.serving_qty)}g
                                                                    </span>
                                                                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                                                                        L: {Math.round(scan.nutrition.fat * scan.serving_qty)}g
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <span className="text-sm font-black text-amber-500 block">+{Math.round(scan.total_calories)}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 block uppercase">kkal</span>
                                                        </div>
                                                        
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleResetScan(scan.id)}
                                                            className="w-8 h-8 rounded-xl text-slate-450 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center justify-center cursor-pointer"
                                                            title="Hapus Makanan"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-neutral-800 mt-6 pt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <span>Scan Hari Ini: <strong className="text-slate-800 dark:text-white">{dashboardData?.summary?.scan_count ?? 0} Kali</strong></span>
                            <span>Total Kalori: <strong className="text-amber-500">{consumed} kkal</strong></span>
                        </div>
                    </div>
                </div>

                {/* Row 3: Weekly SVG Bar Chart */}
                <div className="shadow-xl border border-slate-100 dark:border-neutral-800 rounded-[2.5rem] bg-white dark:bg-neutral-950 p-6 sm:p-8 relative overflow-hidden">
                    {/* Visual glowing frame background */}
                    <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-100 dark:bg-amber-950/20 opacity-30 blur-3xl"></div>
                    
                    <div className="pb-6">
                        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase italic flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                            <span>Statistik Kalori 7 Hari Terakhir</span>
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mt-1">Riwayat tren konsumsi energi harian Anda dalam satu minggu terakhir.</p>
                    </div>
                    
                    <div className="pt-2">
                        {weeklyStats.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-semibold">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-500 mr-2" />
                                Memuat grafik statistik...
                            </div>
                        ) : (
                            <div className="flex h-52 items-end justify-between gap-4 px-2 pt-6 border-b border-slate-100 dark:border-neutral-800 pb-2">
                                {weeklyStats.map((dayData, idx) => {
                                    const barHeightPercent = (dayData.total_calories / maxCalories) * 100;
                                    return (
                                        <div key={idx} className="group relative flex flex-col items-center flex-1">
                                            {/* Beautiful Tooltip Bubble */}
                                            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl shadow-xl z-20 pointer-events-none text-center min-w-[90px] duration-200">
                                                <p className="font-black text-amber-400">{dayData.total_calories} kkal</p>
                                                <p className="text-[9px] text-slate-400 font-bold mt-0.5">{dayData.scan_count} kali scan</p>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                            </div>
 
                                            {/* Bar container */}
                                            <div className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-850 rounded-t-xl overflow-hidden h-36 flex items-end">
                                                <div 
                                                    className="w-full bg-gradient-to-t from-amber-400 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-600 transition-all rounded-t-lg duration-700 ease-out origin-bottom cursor-pointer shadow-xs shadow-amber-500/10"
                                                    style={{ height: `${Math.max(barHeightPercent, 4)}%` }} // Ensure even 0 looks like a minor indicator
                                                />
                                            </div>
 
                                            {/* Day Label */}
                                            <span className="text-[10px] font-black text-slate-400 mt-3 group-hover:text-slate-800 dark:group-hover:text-white transition-colors uppercase tracking-wider">
                                                {dayData.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
