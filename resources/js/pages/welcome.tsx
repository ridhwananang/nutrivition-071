import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ScanEye, ChevronDown } from 'lucide-react';
import GuestLayout from '../layouts/GuestLayout';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { PageProps } from '../types/index';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    onNavigate,
    onLogout,
}: PageProps & { onNavigate?: (page: string) => void; onLogout?: () => void }) {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    // Smooth scroll helper
    const handleScrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const faqItems = [
        {
            q: 'Bagaimana cara kerja teknologi visual AI Nutrivision?',
            a: 'Teknologi kami memproses foto piring makanan Anda menggunakan pengenalan objek gizi canggih yang terbimbing pada basis data pangan Indonesia. AI mendeteksi komponen bahan secara instan untuk memperkirakan komposisinya.',
        },
        {
            q: 'Apakah estimasi kalorinya akurasi tinggi?',
            a: 'Ya! Estimasi dikalibrasi mendekati standar AKG Indonesia dengan margin galat rendah untuk porsi makan rata-rata. Anda juga bisa menyesuaikan berat porsi jika merasa porsinya khusus.',
        },
        {
            q: 'Bisakah saya mengintegrasikan visual layout ini ke Laravel?',
            a: 'Sangat mudah! Struktur component, state management, dan styling Tailwind ini ramah untuk Laravel Breeze, Inertia.js React, atau Laravel blade template.',
        },
        {
            q: 'Apakah data harian asupan saya tersimpan aman?',
            a: 'Tentu saja. Dalam setup Laravel Starter ini, Anda dapat memprogram penyimpanan data pengguna Anda secara kuat di basis data lokal SQLite/PostgreSQL menggunakan Laravel Eloquent ORM.',
        },
    ];

    return (
        <GuestLayout
            user={auth?.user}
            laravelVersion={laravelVersion}
            phpVersion={phpVersion}
            onScrollToSection={handleScrollToSection}
            onNavigate={onNavigate}
            onLogout={onLogout}
        >
            <Head title="Kenali Nutrisi Dalam Sekejap - NutriVision" />

            {/* Hero Section Banner */}
            <section
                id="hero"
                className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-700 pt-12 pb-24 text-white shadow-inner"
            >
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
                    <div className="z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md">
                            <span className="h-2 w-2 animate-ping rounded-full bg-amber-300"></span>
                            <span className="text-xs font-bold tracking-widest uppercase">
                                Laravel Breeze Ready v2.5
                            </span>
                        </div>
                        <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight uppercase italic sm:text-5xl lg:text-7xl">
                            Kenali Nutrisi <br />
                            Dalam Sekejap.
                        </h1>
                        <p className="max-w-sm text-sm leading-relaxed opacity-90 sm:max-w-md sm:text-lg">
                            Sistem deteksi fast-food berbasis AI tercanggih
                            dengan kemudahan drop-in Laravel starter kit. Pantau
                            kalori, lemak, dan protein melalui jepretan kamera
                            Anda.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            {/* Reusable Primary Button matching Breeze principles */}
                            <PrimaryButton
                                onClick={() =>
                                    handleScrollToSection('cara-kerja')
                                }
                                className="bg-white text-black hover:bg-slate-50 hover:text-amber-700"
                            >
                                Pelajari Cara Kerja
                            </PrimaryButton>

                            {/* Reusable Secondary Button matching Breeze principles */}
                            <SecondaryButton
                                onClick={() => handleScrollToSection('insight')}
                            >
                                Lihat Penjelasan Gizi
                            </SecondaryButton>
                        </div>
                    </div>

                    {/* Simulated AI Device visual Mockup */}
                    <div className="relative z-10 mx-auto mt-8 block w-full max-w-xs select-none sm:max-w-md lg:mt-0">
                        <div className="mx-auto max-w-md rotate-3 transform overflow-hidden rounded-[2rem] border border-white/10 bg-white/95 p-4 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-1 sm:rounded-[3rem] dark:bg-neutral-900/95">
                            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem]">
                                <img
                                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400"
                                    className="h-full w-full object-cover shadow-inner"
                                    alt="Visual Burger"
                                />
                                {/* Digital scanner line simulation */}
                                <div className="absolute top-0 right-0 left-0 h-1 animate-bounce bg-amber-400 shadow-xl"></div>
                            </div>

                            <div className="absolute right-6 bottom-6 left-6 flex items-center gap-3 rounded-xl border border-white/20 bg-amber-500/90 p-3 shadow-lg backdrop-blur-md sm:right-10 sm:bottom-10 sm:left-10 sm:gap-4 sm:rounded-2xl sm:p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-md sm:h-12 sm:w-12">
                                    <ScanEye className="h-5 w-5 animate-pulse sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black tracking-widest text-[#FFF] uppercase opacity-80 sm:text-[9px]">
                                        AI DETECTOR
                                    </p>
                                    <p className="text-sm font-black tracking-tighter text-white uppercase italic sm:text-xl">
                                        Beef Burger Detected!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom layout curve shape */}
                <div className="absolute right-0 bottom-0 left-0 h-10 rounded-t-3xl bg-[#FCFCFC] dark:bg-neutral-950"></div>
            </section>

            {/* Step-by-Step Cara Kerja Section */}
            <section
                id="cara-kerja"
                className="bg-[#FCFCFC] py-20 dark:bg-neutral-950"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-black tracking-wider text-amber-600 uppercase dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
                            Langkah Alur
                        </span>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-800 uppercase italic sm:text-4xl dark:text-white">
                            3 Langkah Mudah Deteksi Gizi
                        </h2>
                        <p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm dark:text-neutral-400">
                            Bagaimana asisten gizi cerdas kami mengenali pola
                            hidangan instan Anda
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="group relative rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center transition-all hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-amber-500 font-extrabold text-white shadow-lg shadow-amber-500/20">
                                1
                            </div>
                            <h4 className="mt-4 mb-2 text-lg font-extrabold text-slate-800 italic dark:text-white">
                                Ambil / Unggah Foto
                            </h4>
                            <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-neutral-400">
                                Jepret hidangan Anda secara langsung dengan
                                kamera ponsel atau unggah file gambar yang sudah
                                ada.
                            </p>
                        </div>

                        <div className="group relative rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center transition-all hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-amber-500 font-extrabold text-white shadow-lg shadow-amber-500/20">
                                2
                            </div>
                            <h4 className="mt-4 mb-2 text-lg font-extrabold text-slate-800 italic dark:text-white">
                                Analisis Cerdas Gemini
                            </h4>
                            <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-neutral-400">
                                Algoritma AI secara instan membagi komposisi
                                bahan, makronutrisi, serta mengestimasi takaran
                                kalori.
                            </p>
                        </div>

                        <div className="group relative rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center transition-all hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-amber-500 font-extrabold text-white shadow-lg shadow-amber-500/20">
                                3
                            </div>
                            <h4 className="mt-4 mb-2 text-lg font-extrabold text-slate-800 italic dark:text-white">
                                Rencana Diet Instan
                            </h4>
                            <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-neutral-400">
                                Dapatkan rekomendasi porsi, olahraga pengganti
                                pembakar kalori, serta saran glikemik yang
                                sehat.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Deep Insight Gizi / Statics Section */}
            <section
                id="insight"
                className="border-t border-slate-50 bg-[#FCFCFC] py-24 dark:border-neutral-900 dark:bg-neutral-950"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <div className="bg-amber-105 mb-4 inline-block rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest text-amber-700 uppercase dark:bg-amber-950/30 dark:text-amber-400">
                                Deep Insight AI
                            </div>
                            <h2 className="mb-6 text-3xl leading-tight font-black tracking-tight text-slate-800 uppercase italic sm:text-4xl dark:text-white">
                                Data Lebih Dari <br />
                                Sekadar Angka.
                            </h2>
                            <p className="mb-8 text-sm leading-relaxed font-semibold text-slate-500 sm:text-base dark:text-neutral-400">
                                Setiap hasil scan memberikan rincian
                                mikronutrisi dan makronutrisi yang lengkap. Kami
                                membantu Anda memecah apa yang sebenarnya ada di
                                piring Anda demi masa depan yang lebih bugar.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-amber-500 shadow-inner transition hover:bg-slate-100 dark:border-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                        🍔
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                                            Analisis Komposisi
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                                            Memisahkan bahan utama seperti
                                            protein, lemak, dan karbohidrat
                                            secara otomatis mendalam.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-blue-500 shadow-inner transition hover:bg-slate-100 dark:border-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                        ⚡
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                                            Indeks Glikemik
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                                            Memberikan estimasi dampak makanan
                                            terhadap kadar gula darah Anda
                                            secara real-time.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-green-500 shadow-inner transition hover:bg-slate-100 dark:border-neutral-900 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                        🛡️
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                                            Rekomendasi Porsi
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                                            Saran cerdas untuk menyeimbangkan
                                            makanan berat dengan aktivitas fisik
                                            sehat pilihan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Styled Mock Salad bowl card */}
                        <div className="relative">
                            <div className="relative z-10 mx-auto max-w-sm rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl sm:max-w-md dark:border-neutral-900 dark:bg-neutral-900">
                                <div className="mb-6 flex items-center gap-4">
                                    <img
                                        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120"
                                        className="border-slate-105 h-16 w-16 rounded-2xl border object-cover shadow-md dark:border-neutral-800"
                                        alt="Scan Detail Preview"
                                    />
                                    <div>
                                        <h5 className="text-base font-black tracking-tighter text-slate-800 uppercase italic sm:text-lg dark:text-white">
                                            Salad Bowl Deluxe
                                        </h5>
                                        <span className="text-[10px] font-bold tracking-widest text-green-500 uppercase dark:text-green-400">
                                            Healthy Choice Detected
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-end justify-between">
                                            <span className="text-[9px] font-black text-slate-400 uppercase dark:text-neutral-500">
                                                PROTEIN
                                            </span>
                                            <span className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                18g
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full border border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950">
                                            <div className="h-full w-[30%] rounded-full bg-blue-500"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-end justify-between">
                                            <span className="text-[9px] font-black text-slate-400 uppercase dark:text-neutral-500">
                                                KARBOHIDRAT
                                            </span>
                                            <span className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                28g
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full border border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950">
                                            <div className="h-full w-[10%] rounded-full bg-indigo-500"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-end justify-between">
                                            <span className="text-[9px] font-black text-slate-400 uppercase dark:text-neutral-500">
                                                LEMAK
                                            </span>
                                            <span className="text-xs font-black text-slate-700 dark:text-neutral-300">
                                                12g
                                            </span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full border border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950">
                                            <div className="h-full w-[18%] rounded-full bg-amber-500"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 border-t border-slate-100 pt-6 dark:border-neutral-800">
                                    <div className="dark:bg-neutral-955 text-slate-550 rounded-2xl bg-slate-50 p-4 text-[10px] leading-relaxed font-semibold italic dark:text-neutral-400">
                                        "AI menyarankan untuk menambahkan
                                        segelas air lemon untuk membantu
                                        penyerapan zat besi dari sayuran hijau
                                        ini harian Anda."
                                    </div>
                                </div>
                            </div>
                            {/* Visual blur shapes */}
                            <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-200 opacity-30 blur-3xl dark:opacity-10"></div>
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-200 opacity-30 blur-3xl dark:opacity-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Static Promo Details Section */}
            <section
                id="fitur"
                className="border-t border-slate-50 bg-[#FCFCFC] py-24 dark:border-neutral-900 dark:bg-neutral-950"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-16 text-center">
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-black tracking-wider text-amber-600 uppercase dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
                            Keunggulan Utama
                        </span>
                        <h2 className="mt-3 mb-4 text-3xl font-black tracking-tighter text-slate-800 uppercase italic md:text-4xl dark:text-white">
                            Fitur Utama Nutrivision
                        </h2>
                        <div className="mx-auto h-1 w-16 rounded-full bg-amber-500"></div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="dark:border-neutral-805 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
                                <img
                                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt="Promo 1"
                                />
                                <div className="dark:text-amber-455 absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-amber-600 backdrop-blur-md dark:bg-neutral-900/90">
                                    PREMIUM
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                                Deteksi Makro Akurat
                            </h3>
                            <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                                Gunakan algoritma terbaru kami untuk mendapatkan
                                detail nutrisi yang lebih presisi pada setiap
                                gigitan makanan sehari-hari.
                            </p>
                        </div>

                        <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="dark:border-neutral-805 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
                                <img
                                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt="Promo 2"
                                />
                                <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-blue-600 backdrop-blur-md dark:bg-neutral-900/90 dark:text-blue-400">
                                    NEW FEATURE
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                                Mode Diet Khusus
                            </h3>
                            <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                                Sesuaikan filter pencarian berdasarkan
                                preferensi diet Keto, Vegan, atau Intermittent
                                Fasting yang sesuai jadwal Anda.
                            </p>
                        </div>

                        <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                            <div className="dark:border-neutral-805 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
                                <img
                                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt="Promo 3"
                                />
                                <div className="dark:text-green-455 absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-green-600 backdrop-blur-md dark:bg-neutral-900/90">
                                    SYNCED
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                                Dashboard Real-time
                            </h3>
                            <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                                Data Anda tersimpan secara aman di database
                                Laravel Anda dan dapat diakses dari perangkat
                                mana pun secara instan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Frequently Asked Questions FAQ Accordions */}
            <section className="border-t border-b border-slate-100 bg-slate-50/50 py-20 dark:border-neutral-900 dark:bg-neutral-900/10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="mb-12 text-center">
                        <span className="mx-auto block max-w-max rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-black tracking-widest text-amber-600 uppercase dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400">
                            Tanya Jawab
                        </span>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-800 uppercase italic dark:text-white">
                            Pertanyaan Umum
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            Kami merangkum jawaban atas kebimbangan terselubung
                            Anda
                        </p>
                    </div>

                    <div className="space-y-3.5">
                        {faqItems.map((faq, i) => (
                            <div
                                key={i}
                                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-neutral-900 dark:bg-neutral-900/50"
                            >
                                <button
                                    onClick={() =>
                                        setActiveFaq(activeFaq === i ? null : i)
                                    }
                                    className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-extrabold text-slate-800 transition-colors hover:text-amber-500 sm:text-base dark:text-white dark:hover:text-amber-400"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-amber-500' : ''}`}
                                    />
                                </button>

                                {activeFaq === i && (
                                    <div className="animate-fade-in border-t border-slate-50 px-6 pt-3 pb-5 text-xs leading-relaxed font-medium text-slate-500 sm:text-sm dark:border-neutral-900/60 dark:text-neutral-400">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner section */}
            <section className="bg-[#FCFCFC] py-20 dark:bg-neutral-950">
                <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
                    <div className="relative space-y-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white shadow-xl sm:rounded-[3rem] sm:p-12">
                        <span className="rounded-full border border-white/15 bg-white/20 px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase">
                            Satu Sentuhan Menuju Bugar
                        </span>
                        <h3 className="text-2xl leading-snug font-black tracking-tighter uppercase italic sm:text-5xl sm:leading-none">
                            Mulai Pantau Gizi Harian Anda Sekarang
                        </h3>
                        <p className="mx-auto max-w-lg text-sm leading-relaxed opacity-90">
                            Gabung bersama ribuan pengguna Nutrivision lain yang
                            meraih kontrol atas asupan gizi harian bermula dari
                            jepretan kamera cerdas.
                        </p>

                        <div className="relative z-10 pt-4">
                            {/* Reusable primary button styled cleanly */}
                            <PrimaryButton
                                onClick={() => handleScrollToSection('insight')}
                                className="bg-slate-900 text-xs tracking-widest text-white uppercase hover:bg-slate-800 active:bg-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                            >
                                Mulai Analisis Gizi
                            </PrimaryButton>
                        </div>

                        {/* Decorative items */}
                        <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-white/5"></div>
                        <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-white/5"></div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
