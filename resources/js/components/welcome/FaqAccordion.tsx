import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
            q: 'Teknologi apa saja yang digunakan untuk membangun sistem ini?',
            a: 'Aplikasi ini dikembangkan menggunakan arsitektur modern berbasis Laravel (sebagai RESTful API & Controller) yang terintegrasi secara mulus dengan Inertia.js React di sisi frontend, didukung oleh Tailwind CSS untuk styling responsif, serta AI Engine untuk deteksi gizi.',
        },
        {
            q: 'Apakah data asupan makanan harian saya tersimpan dengan aman?',
            a: 'Tentu saja. Seluruh data asupan gizi harian dan data kredensial Anda disimpan secara aman di basis data PostgreSQL menggunakan enkripsi Eloquent ORM Laravel serta sistem proteksi autentikasi yang ketat.',
        },
    ];

    return (
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
                        Kami merangkum jawaban atas kebimbangan terselubung Anda
                    </p>
                </div>

                <div className="space-y-3.5">
                    {faqItems.map((faq, i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-neutral-900 dark:bg-neutral-900/50"
                        >
                            <button
                                type="button"
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
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
    );
}
