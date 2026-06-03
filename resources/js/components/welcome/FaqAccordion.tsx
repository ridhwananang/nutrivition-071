import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqItems = [
        {
            q: 'Bagaimana cara kerja deteksi makanan berbasis AI pada Nutrivision?',
            a: 'Nutrivision menggunakan teknologi pengenalan gambar berbasis kecerdasan buatan (AI) yang diintegrasikan dengan basis data kandungan gizi pangan Indonesia. Sistem akan menganalisis foto makanan yang diunggah untuk mengidentifikasi jenis makanan dan mengestimasi nilai nutrisinya secara instan.',
        },
        {
            q: 'Seberapa akurat estimasi kalori dan nutrisi yang diberikan?',
            a: 'Estimasi nilai gizi dikalibrasi berdasarkan standar Angka Kecukupan Gizi (AKG) Indonesia dengan tingkat akurasi yang optimal untuk porsi makanan rata-rata. Untuk hasil terbaik, pastikan foto makanan terlihat jelas dan terfokus saat dipindai.',
        },
        {
            q: 'Apakah layanan Nutrivision dapat diakses secara gratis?',
            a: 'Ya, seluruh fitur utama Nutrivision termasuk pemindaian makanan dengan AI, pencatatan asupan gizi harian, serta asisten AI Chatbot dapat diakses dan digunakan secara gratis sepenuhnya.',
        },
        {
            q: 'Bagaimana Nutrivision menjaga keamanan data pribadi saya?',
            a: 'Kami sangat menjaga privasi dan keamanan informasi Anda. Seluruh data asupan gizi harian serta informasi akun pengguna disimpan secara aman menggunakan protokol enkripsi standar industri dan sistem autentikasi yang ketat.',
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
                        Berikut adalah jawaban atas beberapa pertanyaan yang
                        paling sering diajukan mengenai layanan kami.
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
    );
}
