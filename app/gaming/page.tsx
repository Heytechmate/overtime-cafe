"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // *Note: If you don't have this component installed yet via shadcn, the UI will break. See note below.*
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Clock, Users, Check } from "lucide-react";
import Link from "next/link";

export default function GamingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const timeSlots = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"];

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-4 inline-block">← Back to Hub</Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-stone-900">Gaming Lounge</h1>
            <p className="text-stone-500 mt-2">PS5 Pro • 4K 120Hz Screens • Soundproof Zone</p>
          </div>
          <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1">2 Stations Available</Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: Info & Rules */}
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Current Games</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> FC 24 (FIFA)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Call of Duty: MW3</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Spider-Man 2</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500"/> Mortal Kombat 1</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-stone-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>1 Hour Pass</span>
                <span className="font-bold text-xl">LKR 1,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span>3 Hour Bundle</span>
                <span className="font-bold text-xl text-teal-400">LKR 3,500</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Booking Interface */}
        <Card className="md:col-span-2 border-stone-200 shadow-xl">
          <CardHeader>
            <CardTitle>Reserve a Console</CardTitle>
            <CardDescription>Select a date and time to lock in your session.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            
            {/* 1. Date Selection (Simplified visual representation if calendar component missing) */}
            <div className="p-4 border rounded-xl bg-stone-50 flex items-center justify-center">
               {/* Note: This assumes you might not have the full Calendar shadcn component installed yet. 
                   If not, run: npx shadcn-ui@latest add calendar */}
               <div className="text-center">
                  <p className="font-medium mb-2">Select Date</p>
                  <input type="date" className="p-2 border rounded-md" />
               </div>
            </div>

            {/* 2. Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((time) => (
                <Button 
                  key={time} 
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className={selectedTime === time ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  {time}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <div className="text-sm">
              <span className="block text-stone-500">Selected Slot</span>
              <span className="font-bold text-stone-900">{selectedTime || "None selected"}</span>
            </div>
            <Button size="lg" className="bg-stone-900" disabled={!selectedTime}>
              Confirm Booking
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}