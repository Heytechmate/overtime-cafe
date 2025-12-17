"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// ✅ IMPORT: doc, onSnapshot
import { doc, onSnapshot } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 
import { ArrowRight, Coffee, Gamepad2, Laptop, Moon, Paintbrush, Users, CreditCard, MapPin, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  // ✅ NEW: Store Status State
  const [storeStatus, setStoreStatus] = useState({
    isOpen: true,
    message: "Open 24/7 in Colombo."
  });

  // ✅ NEW: Real-time Listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "storeStatus"), (doc) => {
      if (doc.exists()) {
        setStoreStatus(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Hero Section */}
      <section className="relative px-6 pt-24 pb-12 text-center md:pt-32 md:px-12">
        
        {/* Login Button */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50">
          <Link href="/auth">
            <Button variant="ghost" className="text-sm font-medium text-stone-900 dark:text-stone-50 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors gap-2">
              Login <LogIn className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* ✅ UPDATED: Dynamic Status Badge */}
          <div className={`inline-flex items-center rounded-full border px-3 py-1 text-sm shadow-sm transition-colors duration-300 
            ${storeStatus.isOpen 
              ? 'border-stone-200 bg-white text-stone-500 dark:bg-stone-900 dark:border-stone-800' 
              : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-300'
            }`}>
            
            <span className={`flex h-2 w-2 rounded-full mr-2 animate-pulse 
              ${storeStatus.isOpen ? 'bg-teal-500' : 'bg-red-500'}`
            }></span>
            
            {storeStatus.message}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            OverTime <span className="text-teal-600">Café</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            A premium space designed for deep work, creative flow, and late-night gaming. 
            Your productivity sanctuary.
          </p>
        </motion.div>
      </section>

      {/* 2. Bento Grid (Unchanged) */}
      <section className="px-6 pb-24 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          
          <BentoCard 
            href="/menu" 
            title="The Menu" 
            icon={<Coffee className="w-6 h-6 text-white" />}
            desc="Artisan coffee & brain food."
            className="md:col-span-2 md:row-span-2 text-white overflow-hidden relative" 
            darkText={false}
            bgImage="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop"
          />

          <BentoCard 
            href="/work" 
            title="Work Zones" 
            icon={<Laptop className="w-6 h-6 text-teal-600" />}
            desc="Desks & deep work pods."
            className="bg-white border border-stone-200"
          />

          <BentoCard 
            href="/gaming" 
            title="PS5 Lounge" 
            icon={<Gamepad2 className="w-6 h-6 text-indigo-500" />}
            desc="Unwind with FIFA & COD."
            className="bg-stone-100"
          />

          <BentoCard 
            href="/creative" 
            title="Creative Corner" 
            icon={<Paintbrush className="w-6 h-6 text-orange-500" />}
            desc="Paints, canvas & inspiration."
            className="md:col-span-2 bg-orange-50 border border-orange-100"
          />

          <BentoCard 
            href="/pods" 
            title="Sleep Pods" 
            icon={<Moon className="w-6 h-6 text-blue-400" />}
            desc="Recharge in 20m."
            className="bg-stone-900 text-stone-200"
            darkText={false}
          />

          <BentoCard 
            href="/membership" 
            title="Membership" 
            icon={<CreditCard className="w-6 h-6 text-emerald-500" />}
            desc="Exclusive perks."
            className="bg-white border border-stone-200"
          />

           <BentoCard 
            href="/about" 
            title="Our Story" 
            icon={<Users className="w-6 h-6 text-stone-500" />}
            desc="The philosophy."
            className="bg-white border border-stone-200"
          />

          <BentoCard 
            href="/contact" 
            title="Find Us" 
            icon={<MapPin className="w-6 h-6 text-red-500" />}
            desc="Colombo 07."
            className="bg-stone-100 relative overflow-hidden"
            bgImage="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1748&auto=format&fit=crop"
            darkText={true} 
          />
        </div>
      </section>

      {/* 3. Footer (Unchanged) */}
      <footer className="bg-white dark:bg-stone-900 border-t border-stone-200 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Join the Inner Circle</h2>
          <p className="text-stone-500">Get weekly updates on workshops, new menu items, and gaming tournaments.</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <Input placeholder="Enter your email" className="bg-stone-50" />
            <Button className="bg-teal-600 hover:bg-teal-700">Subscribe</Button>
          </div>
          
          <div className="pt-8 space-y-1">
            <p className="text-xs text-stone-300">© 2026 OverTime Café. All rights reserved.</p>
            <p className="text-xs text-stone-300">
              Website by <a href="https://www.heytechmate.com" target="_blank" className="hover:text-stone-400 transition-colors">HeyTechMate.com</a>
            </p>
          </div>
          
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ className, title, desc, icon, href, darkText = true, bgImage }: any) {
  return (
    <Link href={href} className={`group relative flex flex-col justify-between p-6 rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden ${className}`}>
      
      {bgImage && (
        <>
          <div className="absolute inset-0 z-0">
            <img 
              src={bgImage} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
            />
          </div>
          <div className={`absolute inset-0 z-10 ${darkText ? 'bg-white/80' : 'bg-black/60 group-hover:bg-black/50'} transition-colors duration-500`} />
        </>
      )}

      <div className="relative z-20 flex justify-between items-start">
        <div className={`p-3 rounded-full backdrop-blur-md w-fit ${bgImage ? 'bg-white/20' : 'bg-white/10'}`}>
          {icon}
        </div>
        <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 ${darkText ? 'text-stone-800' : 'text-white'}`} />
      </div>
      
      <div className="relative z-20">
        <h3 className={`text-xl font-bold ${darkText ? 'text-stone-900' : 'text-white'}`}>{title}</h3>
        <p className={`text-sm mt-1 font-medium ${darkText ? 'text-stone-600' : 'text-stone-300'}`}>{desc}</p>
      </div>
    </Link>
  );
}