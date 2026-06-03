import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Sparkles,
    X,
    Send,
    Bot,
    User,
    CornerDownLeft,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export default function AiChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: 'Halo! Saya **NutriBot**, asisten gizi cerdas Anda. 🥗 Ada yang bisa saya bantu hari ini?\n\nAnda bisa bertanya tentang cara kerja pemindai makanan visual AI, kalori kuliner Indonesia, atau tips hidup bugar!',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const quickPrompts = [
        'Bagaimana cara kerja NutriVision?',
        'Berapa nutrisi yang ideal untuk mengonsumsi makanan sehat?',
        'Bagaimana cara kerja visual scan AI?',
        'Beri tips diet defisit kalori ',
        'Makanan lokal tinggi protein?',
    ];

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await axios.post(
                '/api/chat',
                {
                    message: textToSend,
                },
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: response.data.reply || 'Maaf, coba lagi sebentar.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Maaf, coba lagi sebentar.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed right-6 bottom-6 z-50 font-sans sm:right-8 sm:bottom-8">
            {/* 1. Floating Action Button (FAB) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 px-5 py-4 text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-amber-500/30 transition-all duration-200 select-none hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/40 focus:outline-none active:scale-95"
                    title="Konsultasi Gizi AI"
                >
                    <Sparkles className="h-4.5 w-4.5 animate-pulse fill-white/20 text-white" />
                    <span className="hidden sm:inline">Tanya AI</span>
                </button>
            )}

            {/* 2. Chat Panel Drawer */}
            {isOpen && (
                <div
                    className={cn(
                        'fixed inset-0 flex h-full w-full animate-in flex-col overflow-hidden rounded-none border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 slide-in-from-bottom-5 fade-in sm:absolute sm:inset-auto sm:-right-2 sm:-bottom-2 sm:h-[540px] sm:w-[380px] sm:rounded-[2rem] dark:border-neutral-900 dark:bg-neutral-950/95',
                    )}
                >
                    {/* Header */}
                    <div className="relative flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4.5 text-white">
                        {/* Ambient circle glow */}
                        <div className="pointer-events-none absolute -top-8 -left-8 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex h-9.5 w-9.5 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-md">
                                <Bot className="h-5.5 w-5.5" />
                                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 animate-ping rounded-full border-2 border-white bg-emerald-500"></span>
                                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm leading-none font-black tracking-wider uppercase italic">
                                    NutriBot AI
                                </h4>
                                <span className="mt-1.5 block text-[10px] leading-none font-bold opacity-80">
                                    Asisten Gizi Anda
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex cursor-pointer items-center justify-center rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/25 active:scale-95"
                            title="Tutup Obrolan"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/50 px-6 py-4 dark:bg-neutral-900/10">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    'flex w-full gap-2',
                                    msg.sender === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                            >
                                {msg.sender === 'ai' && (
                                    <div className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                        <Bot className="h-4.5 w-4.5" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        'max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed font-semibold shadow-xs',
                                        msg.sender === 'user'
                                            ? 'rounded-tr-xs bg-amber-500 text-left text-white shadow-md shadow-amber-500/10'
                                            : 'dark:border-neutral-850 rounded-tl-xs border border-slate-100 bg-white text-left whitespace-pre-line text-slate-800 dark:bg-neutral-900 dark:text-neutral-200',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: msg.text
                                            .replace(
                                                /\*\*(.*?)\*\*/g,
                                                '<strong>$1</strong>',
                                            )
                                            .replace(/• /g, '• '),
                                    }}
                                />
                            </div>
                        ))}

                        {/* Typing Bouncing indicator */}
                        {isTyping && (
                            <div className="flex w-full items-center justify-start gap-2">
                                <div className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                    <Bot className="h-4.5 w-4.5 animate-bounce" />
                                </div>
                                <div className="dark:border-neutral-850 flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-slate-100 bg-white px-4 py-3 dark:bg-neutral-900">
                                    <span
                                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                                        style={{ animationDelay: '0ms' }}
                                    />
                                    <span
                                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                                        style={{ animationDelay: '150ms' }}
                                    />
                                    <span
                                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                                        style={{ animationDelay: '300ms' }}
                                    />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions scroll row */}
                    {messages.length === 1 && !isTyping && (
                        <div className="border-t border-slate-50 bg-white px-6 py-2 dark:border-neutral-900 dark:bg-neutral-950">
                            <p className="mb-1.5 text-left text-[9px] font-black tracking-wider text-slate-400 uppercase">
                                Saran Pertanyaan:
                            </p>
                            <div className="flex scrollbar-thin gap-2 overflow-x-auto pb-1.5 select-none">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            handleSendMessage(
                                                prompt.replace(
                                                    / [📸🍳🥑🍗]/g,
                                                    '',
                                                ),
                                            )
                                        }
                                        className="dark:border-neutral-850 text-slate-650 flex-shrink-0 cursor-pointer rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold transition hover:border-amber-400 hover:bg-amber-50/5 hover:text-amber-600 dark:bg-neutral-900 dark:text-neutral-300"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Input form footer */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(inputValue);
                        }}
                        className="flex items-center gap-2 border-t border-slate-100 bg-white px-6 py-4.5 dark:border-neutral-900 dark:bg-neutral-950"
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tanya gizi, resep, atau defisit kalori..."
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-inner transition focus:border-amber-500 focus:ring-amber-500 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder-neutral-500"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={isTyping || !inputValue.trim()}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25 transition duration-150 hover:bg-amber-600 active:scale-95 disabled:scale-100 disabled:opacity-40"
                            title="Kirim Pesan"
                        >
                            <Send className="h-4.5 w-4.5 fill-white/10 text-white" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
