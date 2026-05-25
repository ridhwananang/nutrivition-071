import { Head, usePage, useHttp } from '@inertiajs/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    Loader2, Upload, Apple, Flame, Utensils, Trash2, 
    Plus, ChevronDown, Zap, Check, RotateCcw, Sparkles, 
    TrendingUp, Dumbbell, Calendar, Heart, Eye, Target, Sparkle
} from 'lucide-react';
import Api from '@/actions/App/Http/Controllers/Api';
import { dashboard } from '@/routes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';

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
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium text-neutral-600 dark:text-neutral-300">{name}</span>
                    <span className="text-muted-foreground">
                        <strong className="text-foreground font-semibold">{macro.value}</strong> / {macro.goal} {macro.unit}
                    </span>
                </div>
                <div className="h-2.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
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
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground animate-pulse font-medium">Menyelaraskan data gizi Nutrivision...</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 dark:border-neutral-800">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>Halo, {auth.user.name.split(' ')[0]}!</span>
                            <Sparkle className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-bounce" />
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pindai makanan Anda, pantau asupan gizi harian, dan pertahankan pola hidup sehat.
                        </p>
                    </div>
                </div>

                {/* Row 1: Summary ring and macros */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Macros Progress Card */}
                    <Card className="lg:col-span-3 shadow-sm relative overflow-hidden bg-radial from-emerald-500/5 via-card to-card border-primary/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Apple className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                                <span>Keseimbangan Nutrisi</span>
                            </CardTitle>
                            <CardDescription>Capaian nutrisi dan energi makanan Anda hari ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {renderMacro('Kalori', { value: consumed, goal: dashboardData?.calorie_goal ?? 2000, unit: 'kkal' }, 'bg-red-500', 'bg-red-100')}
                            {renderMacro('Protein', dashboardData?.macros.protein, 'bg-orange-500', 'bg-orange-100')}
                            {renderMacro('Karbohidrat', dashboardData?.macros.carbs, 'bg-blue-500', 'bg-blue-100')}
                            {renderMacro('Lemak', dashboardData?.macros.fat, 'bg-yellow-500', 'bg-yellow-100')}
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2: Scan AI Form and Recent Scans list */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Scanner Upload Form */}
                    <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 overflow-hidden relative">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                                <span>Pindai Makanan dengan AI</span>
                            </CardTitle>
                            <CardDescription>
                                Unggah foto makanan Anda. AI akan mengidentifikasi gizi, kalori, dan tipe makronutrisinya secara instan.
                            </CardDescription>
                        </CardHeader>
                        
                        <form onSubmit={handleScanSubmit}>
                            <CardContent className="space-y-4">
                                {/* Upload Dropzone */}
                                <div 
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group ${
                                        imagePreview 
                                            ? 'border-primary/50 bg-neutral-50/50 dark:bg-neutral-900/50' 
                                            : 'border-neutral-300 hover:border-primary/50 dark:border-neutral-700 hover:bg-neutral-50/30 dark:hover:bg-neutral-900/10'
                                    }`}
                                >
                                    {imagePreview ? (
                                        <div className="relative w-full h-40 flex items-center justify-center">
                                            <img 
                                                src={imagePreview} 
                                                alt="Food Preview" 
                                                className="h-full rounded-lg object-contain max-w-[85%] z-10 transition-transform group-hover:scale-102"
                                            />
                                            {/* AI Scanning Bar Overlay */}
                                            {scanForm.processing && (
                                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-lg z-20">
                                                    <div 
                                                        className="absolute left-0 right-0 h-1.5 bg-primary shadow-[0_0_10px_#4f46e5] w-full"
                                                        style={{
                                                            animation: 'scan-animation 2.2s ease-in-out infinite',
                                                        }}
                                                    />
                                                    <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                                                    <span className="text-xs font-bold text-white tracking-wide animate-pulse">Analisis AI Sedang Berjalan...</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full inline-block group-hover:scale-105 transition-transform">
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-semibold">Tarik & lepas foto makanan di sini, atau klik untuk memilih</p>
                                            <p className="text-xs text-muted-foreground">Mendukung JPEG, PNG hingga 5 MB</p>
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

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="meal_type" className="text-xs font-bold">Waktu Makan</Label>
                                        <Select 
                                            value={scanForm.data.meal_type} 
                                            onValueChange={(val: any) => scanForm.setData('meal_type', val)}
                                        >
                                            <SelectTrigger className="capitalize text-xs cursor-pointer">
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
                                    
                                    <div className="space-y-1.5">
                                        <Label htmlFor="serving_qty" className="text-xs font-bold">Jumlah Porsi</Label>
                                        <Input 
                                            id="serving_qty"
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={scanForm.data.serving_qty}
                                            onChange={(e) => scanForm.setData('serving_qty', parseFloat(e.target.value) || 1)}
                                            className="text-xs font-medium"
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-neutral-50/50 dark:bg-neutral-900/10 border-t py-4 dark:border-neutral-800 flex justify-between gap-4">
                                {imagePreview && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            setImagePreview(null);
                                            scanForm.setData('image', null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="text-xs"
                                        disabled={scanForm.processing}
                                    >
                                        Reset Gambar
                                    </Button>
                                )}
                                <Button 
                                    type="submit" 
                                    size="sm"
                                    disabled={scanForm.processing || !scanForm.data.image}
                                    className="ml-auto text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                                >
                                    {scanForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Menganalisis...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                            <span>Pindai Sekarang</span>
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Recent Food Scans List */}
                    <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-primary" />
                                <span>Makanan Hari Ini</span>
                            </CardTitle>
                            <CardDescription>Makanan yang telah dipindai dan dikonsumsi pada hari ini.</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-4 px-6">
                            {dashboardData?.recent_scans.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2">
                                    <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                        <Apple className="w-6 h-6 text-muted-foreground/60" />
                                    </div>
                                    <p className="text-sm font-semibold text-muted-foreground">Belum ada makanan yang dipindai hari ini</p>
                                    <p className="text-xs text-muted-foreground/80 max-w-[280px]">Gunakan panel sebelah kiri untuk memindai asupan pertama Anda!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {dashboardData?.recent_scans.map((scan) => {
                                        const mealTypeColors = {
                                            breakfast: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                                            lunch: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
                                            dinner: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
                                            snack: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
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
                                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden border flex-shrink-0 flex items-center justify-center">
                                                        {scan.scan_image ? (
                                                            <img 
                                                                src={`/storage/${scan.scan_image}`} 
                                                                alt={scan.nutrition?.item || 'Food'} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback if image not loaded
                                                                    (e.target as HTMLImageElement).src = '/images/placeholder-food.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <Apple className="w-6 h-6 text-muted-foreground/50" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Food Name & Details */}
                                                    <div className="space-y-0.5">
                                                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                                                            {scan.nutrition?.item || 'Makanan Tidak Dikenal'}
                                                        </h4>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge className={`text-[10px] py-0 px-2 font-semibold capitalize border-0 shadow-none ${mealTypeColors[scan.meal_type as keyof typeof mealTypeColors] || 'bg-neutral-100 text-neutral-800'}`}>
                                                                {mealLabels[scan.meal_type as keyof typeof mealLabels] || scan.meal_type}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                {scan.serving_qty} porsi
                                                            </span>
                                                            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-1 rounded-sm">
                                                                {Math.round(scan.confidence * 100)}% AI
                                                            </span>
                                                        </div>
                                                        {scan.nutrition && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold mt-1.5 flex-wrap">
                                                                <span className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-sm">
                                                                    {Math.round(scan.nutrition.calories * scan.serving_qty)} kkal
                                                                </span>
                                                                <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-sm">
                                                                    P: {Math.round(scan.nutrition.protein * scan.serving_qty)}g
                                                                </span>
                                                                <span className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm">
                                                                    K: {Math.round(scan.nutrition.carbs * scan.serving_qty)}g
                                                                </span>
                                                                <span className="bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded-sm">
                                                                    L: {Math.round(scan.nutrition.fat * scan.serving_qty)}g
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-red-500 block">+{Math.round(scan.total_calories)}</span>
                                                        <span className="text-[10px] text-muted-foreground block">kkal</span>
                                                    </div>
                                                    
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleResetScan(scan.id)}
                                                        className="w-8 h-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 cursor-pointer"
                                                        title="Hapus Makanan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="bg-neutral-50/50 dark:bg-neutral-900/10 border-t py-3.5 px-6 flex justify-between items-center text-xs text-muted-foreground dark:border-neutral-800">
                            <span>Scan Hari Ini: <strong>{dashboardData?.summary?.scan_count ?? 0} Kali</strong></span>
                            <span>Total Gizi Terkumpul: <strong>{consumed} kkal</strong></span>
                        </CardFooter>
                    </Card>
                </div>

                {/* Row 3: Weekly SVG Bar Chart */}
                <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            <span>Statistik Kalori 7 Hari Terakhir</span>
                        </CardTitle>
                        <CardDescription>Riwayat tren konsumsi energi harian Anda dalam satu minggu terakhir.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-2">
                        {weeklyStats.length === 0 ? (
                            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                Memuat grafik statistik...
                            </div>
                        ) : (
                            <div className="flex h-52 items-end justify-between gap-4 px-2 pt-6 border-b pb-2 dark:border-neutral-800">
                                {weeklyStats.map((dayData, idx) => {
                                    const barHeightPercent = (dayData.total_calories / maxCalories) * 100;
                                    return (
                                        <div key={idx} className="group relative flex flex-col items-center flex-1">
                                            {/* Beautiful Tooltip Bubble */}
                                            <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 dark:bg-neutral-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl z-20 pointer-events-none text-center min-w-[90px] duration-200">
                                                <p className="font-extrabold text-xs text-primary">{dayData.total_calories} kkal</p>
                                                <p className="text-[10px] text-neutral-400 mt-0.5">{dayData.scan_count} kali scan</p>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-neutral-900 dark:bg-neutral-800 rotate-45" />
                                            </div>

                                            {/* Bar container */}
                                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-md overflow-hidden h-36 flex items-end">
                                                <div 
                                                    className="w-full bg-primary/75 group-hover:bg-primary transition-all rounded-t-md duration-700 ease-out origin-bottom cursor-pointer shadow-xs"
                                                    style={{ height: `${Math.max(barHeightPercent, 4)}%` }} // Ensure even 0 looks like a minor indicator
                                                />
                                            </div>

                                            {/* Day Label */}
                                            <span className="text-xs font-bold text-muted-foreground mt-3 group-hover:text-foreground transition-colors uppercase tracking-wider">
                                                {dayData.day}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

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
