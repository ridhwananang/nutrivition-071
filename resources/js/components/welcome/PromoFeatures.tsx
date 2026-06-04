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
                                src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt="Promo 1"
                            />
                            <div className="dark:text-amber-455 absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-amber-600 backdrop-blur-md dark:bg-neutral-900/90">
                                AI SCAN
                            </div>
                        </div>
                        <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                            Deteksi Menu Populer
                        </h3>
                        <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                            Pindai menu hidangan dari KFC, McDonald's, dan Burger King secara instan untuk mendapatkan estimasi nilai gizi yang akurat.
                        </p>
                    </div>

                    <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                        <div className="dark:border-neutral-855 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt="Promo 2"
                            />
                            <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-blue-600 backdrop-blur-md dark:bg-neutral-900/90 dark:text-blue-400">
                                INTERACTIVE
                            </div>
                        </div>
                        <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                            Tanya AI Chatbot
                        </h3>
                        <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                            Konsultasikan asupan gizi, tips defisit kalori, hingga rekomendasi olahraga pembakar energi langsung dengan asisten NutriBot.
                        </p>
                    </div>

                    <div className="group cursor-pointer rounded-3xl border border-slate-100/80 bg-slate-50/50 p-6 transition hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                        <div className="dark:border-neutral-855 relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-slate-50 shadow-md">
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt="Promo 3"
                            />
                            <div className="dark:text-green-455 absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[9px] font-black text-green-600 backdrop-blur-md dark:bg-neutral-900/90">
                                REAL-TIME
                            </div>
                        </div>
                        <h3 className="mb-2 text-lg font-black tracking-tight text-slate-800 uppercase italic transition group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                            Dashboard & Tracker
                        </h3>
                        <p className="text-slate-550 text-xs leading-relaxed font-semibold dark:text-neutral-400">
                            Pantau akumulasi energi harian (kalori) serta keseimbangan protein, karbohidrat, dan lemak Anda secara dinamis.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
