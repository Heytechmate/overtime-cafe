"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, PenTool, Calendar, ArrowRight, Ban, CheckCircle2 } from "lucide-react";

export default function CreativePage() {
  const [studioStatus, setStudioStatus] = useState<any>(null);

  useEffect(() => {
    // Listen to "creative_corner"
    const unsub = onSnapshot(doc(db, "facilities", "creative_corner"), (doc) => {
      setStudioStatus(doc.data());
    });
    return () => unsub();
  }, []);

  const isOccupied = studioStatus?.status === "Occupied";

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-stone-950 font-sans">
      <section className="bg-orange-50 dark:bg-stone-900 py-20 px-6 border-b border-orange-100 dark:border-stone-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
            
            {/* Dynamic Badge */}
            <div className="flex justify-center mb-4">
               {isOccupied ? (
                 <Badge className="bg-red-500 text-white gap-2 px-3 py-1"><Ban className="w-3 h-3"/> Studio Full / In Use</Badge>
               ) : (
                 <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-300 gap-2 px-3 py-1"><CheckCircle2 className="w-3 h-3"/> The Studio is Open</Badge>
               )}
            </div>

            <h1 className="text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                Unleash Your Inner Artist
            </h1>
            <div className="pt-6">
                <Button 
                    className={`rounded-full px-8 h-12 transition-all ${isOccupied ? 'bg-stone-300 text-stone-500' : 'bg-orange-600 hover:bg-orange-700 text-white'}`} 
                    disabled={isOccupied}
                >
                    {isOccupied ? "Check Back Later" : "Book an Easel"}
                </Button>
            </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        {/* ... (Keep existing workshop grid code) ... */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Upcoming Workshops</h2>
            <Link href="#" className="text-orange-600 font-medium flex items-center hover:underline">View Full Calendar <ArrowRight className="w-4 h-4 ml-1"/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WorkshopCard title="Sip & Paint: Sunset Skylines" date="Sat, Dec 16 • 7:00 PM" price="LKR 3,500" imageColor="bg-orange-200" tags={["Beginner", "Materials Included"]} />
            <WorkshopCard title="Journaling for Mindfulness" date="Sun, Dec 17 • 10:00 AM" price="LKR 1,500" imageColor="bg-stone-200" tags={["Relaxation", "Coffee"]} />
        </div>
      </section>
    </div>
  );
}

// Helper (unchanged)
function WorkshopCard({ title, date, price, imageColor, tags }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
            <div className={`h-48 ${imageColor} w-full`} />
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-xl text-stone-900">{title}</h3><span className="font-bold text-orange-600">{price}</span></div>
                <div className="flex items-center text-stone-500 text-sm mb-4"><Calendar className="w-4 h-4 mr-2"/> {date}</div>
                <div className="flex gap-2">{tags.map((t: string) => (<Badge key={t} variant="secondary" className="bg-stone-100 text-stone-600">{t}</Badge>))}</div>
            </CardContent>
        </Card>
    )
}