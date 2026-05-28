import React from 'react';

export default function WorkingSteps() {
    return (
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
                            kamera ponsel atau unggah file gambar yang sudah ada.
                        </p>
                    </div>

                    <div className="group relative rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center transition-all hover:border-amber-400 dark:border-neutral-900 dark:bg-neutral-900/30 dark:hover:border-amber-500">
                        <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-amber-500 font-extrabold text-white shadow-lg shadow-amber-500/20">
                            2
                        </div>
                        <h4 className="mt-4 mb-2 text-lg font-extrabold text-slate-800 italic dark:text-white">
                            Analisis Gizi Otomatis
                        </h4>
                        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-neutral-400">
                            Algoritma AI secara instan membagi komposisi
                            bahan, makronutrisi, serta mengestimasi takaran kalori.
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
                            pembakar kalori, serta saran glikemik yang sehat.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
