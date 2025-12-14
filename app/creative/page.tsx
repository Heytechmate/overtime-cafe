"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Paintbrush, PenTool, Calendar, Clock, ArrowRight } from "lucide-react";

export default function CreativePage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-stone-950 font-sans">
      
      {/* Hero Header */}
      <section className="bg-orange-50 dark:bg-stone-900 py-20 px-6 border-b border-orange-100 dark:border-stone-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
            <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-300">The Studio</Badge>
            <h1 className="text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                Unleash Your Inner Artist
            </h1>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                A dedicated space with easels, high-quality paints, and zero judgment. 
                Come for the coffee, stay for the canvas.
            </p>
            <div className="pt-6">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 h-12">
                    Book an Easel
                </Button>
            </div>
        </div>
      </section>

      {/* Workshop Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200">Upcoming Workshops</h2>
            <Link href="#" className="text-orange-600 font-medium flex items-center hover:underline">
                View Full Calendar <ArrowRight className="w-4 h-4 ml-1"/>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WorkshopCard 
                title="Sip & Paint: Sunset Skylines"
                date="Sat, Dec 16 • 7:00 PM"
                price="LKR 3,500"
                imageColor="bg-orange-200"
                tags={["Beginner", "Materials Included"]}
            />
            <WorkshopCard 
                title="Journaling for Mindfulness"
                date="Sun, Dec 17 • 10:00 AM"
                price="LKR 1,500"
                imageColor="bg-stone-200"
                tags={["Relaxation", "Coffee"]}
            />
        </div>
      </section>

      {/* Supplies Menu */}
      <section className="bg-white dark:bg-stone-900 py-16 px-6 border-t border-stone-100 dark:border-stone-800">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-8 text-center">Studio Supplies Available</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SupplyItem icon={<Paintbrush className="text-pink-500"/>} name="Acrylic Set" price="LKR 500" />
                <SupplyItem icon={<PenTool className="text-blue-500"/>} name="Sketching Kit" price="LKR 300" />
                <SupplyItem icon={<div className="w-4 h-4 bg-yellow-500 rounded-full"/>} name="Canvas (Medium)" price="LKR 800" />
                <SupplyItem icon={<div className="w-4 h-4 bg-green-500 rounded-full"/>} name="Clay Kit" price="LKR 1200" />
            </div>
        </div>
      </section>

    </div>
  );
}

// Components specific to this page
function WorkshopCard({ title, date, price, imageColor, tags }: any) {
    return (
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
            <div className={`h-48 ${imageColor} w-full`} />
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-stone-900">{title}</h3>
                    <span className="font-bold text-orange-600">{price}</span>
                </div>
                <div className="flex items-center text-stone-500 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-2"/> {date}
                </div>
                <div className="flex gap-2">
                    {tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="bg-stone-100 text-stone-600">{t}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function SupplyItem({ icon, name, price }: any) {
    return (
        <div className="flex flex-col items-center p-4 border border-stone-100 rounded-xl bg-stone-50 dark:bg-stone-800 dark:border-stone-700">
            <div className="mb-2 p-2 bg-white dark:bg-stone-900 rounded-full shadow-sm">{icon}</div>
            <span className="font-medium text-stone-800 dark:text-stone-200">{name}</span>
            <span className="text-xs text-stone-500">{price}</span>
        </div>
    )
}