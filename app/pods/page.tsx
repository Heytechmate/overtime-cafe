"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Moon, Stars, Bell, ArrowLeft } from "lucide-react";

export default function SleepPodsPage() {
  return (
    <div className="min-h-screen bg-stone-900 text-stone-300 font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-8">
        <Link href="/" className="text-sm text-stone-500 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto space-y-8">
        
        <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 py-1.5 px-4 rounded-full backdrop-blur-md bg-indigo-950/30">
          <Stars className="w-3 h-3 mr-2" /> Launching Winter 2024
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          Recharge at the Speed of Life.
        </h1>
        
        <p className="text-xl text-stone-400 max-w-2xl leading-relaxed">
          Soundproof, climate-controlled sleep pods tailored for the 20-minute power nap. 
          Drift off with guided meditation and wake up with gentle light therapy.
        </p>

        {/* Waitlist Form */}
        <div className="w-full max-w-sm flex gap-2 mt-8">
          <Input 
            placeholder="Enter your email" 
            className="bg-white/5 border-stone-800 text-white placeholder:text-stone-600 focus-visible:ring-indigo-500" 
          />
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Bell className="w-4 h-4 mr-2" /> Notify Me
          </Button>
        </div>

        <p className="text-xs text-stone-600">
          Join 400+ members on the waitlist. Early access members get 3 free naps.
        </p>
      </div>

      {/* Feature Teaser Grid */}
      <div className="relative z-10 border-t border-stone-800 bg-stone-900/50 backdrop-blur-sm p-8 md:p-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <Feature 
            icon={<Moon className="text-indigo-400" />} 
            title="Zero Gravity" 
            desc="Ergonomic reclining positions to reduce spinal pressure." 
          />
          <Feature 
            icon={<div className="w-5 h-5 rounded-full border-2 border-teal-400" />} 
            title="O2 Enrichment" 
            desc="Purified, oxygen-rich air to clear brain fog instantly." 
          />
          <Feature 
            icon={<div className="w-5 h-5 rounded-full bg-orange-400/20 border border-orange-400" />} 
            title="Smart Wake" 
            desc="Vibration alarms that wake you in the lightest sleep stage." 
          />
        </div>
      </div>

    </div>
  );
}

function Feature({ icon, title, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="inline-flex p-3 rounded-xl bg-stone-800/50">{icon}</div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-stone-500">{desc}</p>
    </div>
  )
}