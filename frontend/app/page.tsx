'use client';

import { Sparkles, HeartHandshake, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center text-center px-4">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      
      {/* Brand Header */}
      <div className="relative z-10 max-w-3xl">
        <div className="mx-auto w-fit px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/20 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5 shadow-inner">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Janma Chino Kundali Platform
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
          Unlock Astrological Wisdom & Synergy
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-xl mx-auto">
          Explore precise sidereal calculations, generate high-fidelity divisional charts, check relationship compatibility, or upload your physical Janma Chino for an instant AI reading.
        </p>
      </div>

      {/* Feature Navigation Cards */}
      <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 max-w-4xl w-full">
        {/* Card 1: Kundali Generator & Photo Upload */}
        <Link 
          href="/chart"
          className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-left hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300 shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
        >
          <div className="p-3 w-fit rounded-lg bg-amber-950 border border-amber-500/20 text-amber-400 mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
            Generate & Parse Chart <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enter birth details to generate exact divisional charts and Panchanga telemetry, or upload a photo of your paper Kundali for a Gemini-powered analysis.
          </p>
        </Link>

        {/* Card 2: Ashta Koota Matching */}
        <Link 
          href="/compatibility"
          className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-left hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300 shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
        >
          <div className="p-3 w-fit rounded-lg bg-amber-950 border border-amber-500/20 text-amber-400 mb-6 shadow-inner group-hover:scale-110 transition-transform">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
            Check Compatibility <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Compare two charts using the traditional 36-guna Ashta Koota matching framework, accompanied by in-depth psychological and behavioral synergy reports.
          </p>
        </Link>
      </div>
    </section>
  );
}
