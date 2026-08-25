'use client';

import { useState } from 'react';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Tshirt3D from './Tshirt3D';

const display = Space_Grotesk({
    subsets: ['latin'],
    weight: ['500', '700'],
    variable: '--font-display',
});

const mono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-mono',
});

const TICKER_TEXT = '100% COTTON — LIMITED DROP — FREE SHIPPING OVER $50 — ';

export default function Hero() {
    const [tagHover, setTagHover] = useState(false);

    return (
        <section
            className={`${display.variable} ${mono.variable} relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-[#f5f5f0]`}
        >
            {/* subtle grain */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* top ticker */}
            <div className="absolute left-0 right-0 top-0 z-20 overflow-hidden border-b border-[#2a2a2a] py-2">
                <div className="flex w-max animate-marquee whitespace-nowrap font-mono text-[11px] tracking-widest text-[#666]">
                    <span className="flex shrink-0">
                        {Array(8)
                            .fill(TICKER_TEXT)
                            .map((t, i) => (
                                <span key={`a-${i}`} className="mx-4">
                                    {t}
                                </span>
                            ))}
                    </span>
                    <span className="flex shrink-0" aria-hidden="true">
                        {Array(8)
                            .fill(TICKER_TEXT)
                            .map((t, i) => (
                                <span key={`b-${i}`} className="mx-4">
                                    {t}
                                </span>
                            ))}
                    </span>
                </div>
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-20 lg:flex-row lg:items-center lg:gap-12 lg:px-12">
                {/* left: copy */}
                <div className="flex-1">
                    <span className="mb-6 inline-block rounded-full border border-[#333] px-3 py-1 font-mono text-xs tracking-[0.3em] text-[#888]">
                        SS26 COLLECTION — DROP 04
                    </span>

                    <h1 className="font-display text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.88]">
                        BLANK
                        <br />
                        <span className="relative inline-block">
                            CANVAS
                            <svg
                                className="absolute -bottom-2 left-0 w-full"
                                height="12"
                                viewBox="0 0 300 12"
                                preserveAspectRatio="none"
                            >
                                <line
                                    x1="0"
                                    y1="6"
                                    x2="300"
                                    y2="6"
                                    stroke="#f5f5f0"
                                    strokeWidth="2"
                                    strokeDasharray="6 6"
                                />
                            </svg>
                        </span>
                    </h1>

                    <p className="mt-8 max-w-md text-base leading-relaxed text-[#a0a0a0]">
                        Heavyweight cotton, cut for movement. No logos, no noise — just
                        the shirt, worn your way.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <button className="bg-[#f5f5f0] px-8 py-4 font-mono text-xs font-medium uppercase tracking-widest text-black transition-opacity hover:opacity-80">
                            Shop the Drop
                        </button>
                        <button className="border border-[#333] px-8 py-4 font-mono text-xs uppercase tracking-widest text-[#e5e5e0] transition-colors hover:border-[#f5f5f0]">
                            View Lookbook
                        </button>
                    </div>
                </div>

                {/* right: 3D garment + hanging tag */}
                <div className="relative mt-20 flex flex-1 items-center justify-center lg:mt-0">
                    <Tshirt3D />

                    {/* hanging care tag */}
                    <div
                        onMouseEnter={() => setTagHover(true)}
                        onMouseLeave={() => setTagHover(false)}
                        className="absolute -right-2 top-6 origin-top cursor-default transition-transform duration-300"
                        style={{ transform: `rotate(${tagHover ? 8 : 4}deg)` }}
                    >
                        <div className="mx-auto h-8 w-px bg-[#444]" />
                        <div className="border border-[#333] bg-[#0a0a0a] px-4 py-3 font-mono text-[10px] leading-4 text-[#999]">
                            <div className="text-[#f5f5f0]">NO. 0412</div>
                            <div>100% COTTON</div>
                            <div>MADE TO LAST</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}