import React from 'react';

export default function PromoFeatures() {
    return (
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
                        <div className="dark:border-neutral-855 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
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
                            detail nutrisi yang lebih presisi pada setiap gigitan makanan sehari-hari.
                        </p>
                    </div>

                    <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                        <div className="dark:border-neutral-855 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
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
                            Sesuaikan filter pencarian berdasarkan preferensi diet Keto, Vegan, atau Intermittent Fasting yang sesuai jadwal Anda.
                        </p>
                    </div>

                    <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                        <div className="dark:border-neutral-855 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
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
                            Data Anda tersimpan secara aman di database Laravel Anda dan dapat diakses dari perangkat mana pun secara instan.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
