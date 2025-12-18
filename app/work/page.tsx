"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Users, Mic, Wifi, Coffee, Power } from "lucide-react";

export default function WorkPage() {
  const [selectedZone, setSelectedZone] = useState("silent");
  // NEW: Object to store status of multiple zones
  const [facilities, setFacilities] = useState<any>({});

  useEffect(() => {
    // Listen to "quiet_zone"
    const unsub1 = onSnapshot(doc(db, "facilities", "quiet_zone"), (doc) => {
        setFacilities((prev: any) => ({...prev, silent: doc.data()}));
    });
    // Listen to "meeting_pod"
    const unsub2 = onSnapshot(doc(db, "facilities", "meeting_pod"), (doc) => {
        setFacilities((prev: any) => ({...prev, meeting: doc.data()}));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  // Determine if CURRENT tab is busy
  const currentStatus = facilities[selectedZone];
  const isOccupied = currentStatus?.status === "Occupied";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto mb-12">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-4 inline-block">← Back to Hub</Link>
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50">Work Zones</h1>
            <p className="text-stone-500 mt-2 dark:text-stone-400">Choose your environment. Optimize your output.</p>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-white dark:bg-stone-900 gap-1"><Wifi className="w-3 h-3"/> Gigabit WiFi</Badge>
             <Badge variant="outline" className="bg-white dark:bg-stone-900 gap-1"><Power className="w-3 h-3"/> Every Seat Power</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="silent" className="w-full" onValueChange={setSelectedZone}>
            <TabsList className="grid w-full grid-cols-3 bg-stone-200 dark:bg-stone-800">
              <TabsTrigger value="silent">Deep Work</TabsTrigger>
              <TabsTrigger value="collab">Collab</TabsTrigger>
              <TabsTrigger value="meeting">Meeting Pods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="silent" className="mt-6 space-y-4">
              <div className="relative h-64 bg-stone-800 rounded-xl overflow-hidden flex items-center justify-center">
                 <Laptop className="text-stone-600 w-16 h-16 opacity-50" />
                 <span className="absolute bottom-4 left-4 text-white font-semibold">The Library Zone</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FeatureCard icon={<Mic className="w-5 h-5 text-red-400"/>} title="Strictly Silent" desc="No calls allowed." />
                 <FeatureCard icon={<Users className="w-5 h-5 text-stone-400"/>} title="Single Occupancy" desc="Individual desks." />
              </div>
            </TabsContent>

            <TabsContent value="collab" className="mt-6 space-y-4">
               <div className="relative h-64 bg-stone-300 rounded-xl overflow-hidden flex items-center justify-center">
                 <Users className="text-stone-500 w-16 h-16 opacity-50" />
                 <span className="absolute bottom-4 left-4 text-stone-900 font-semibold">The Commons</span>
              </div>
              <p className="text-stone-600">Perfect for casual meetings, brainstorming, and coffee chats.</p>
            </TabsContent>

            <TabsContent value="meeting" className="mt-6 space-y-4">
               <div className="relative h-64 bg-teal-900 rounded-xl overflow-hidden flex items-center justify-center">
                 <Mic className="text-teal-600 w-16 h-16 opacity-50" />
                 <span className="absolute bottom-4 left-4 text-white font-semibold">Soundproof Pods</span>
              </div>
              <p className="text-stone-600">Zoom-ready pods with ring lights and 4K webcams.</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dynamic Booking Card */}
        <Card className={`border-stone-200 dark:border-stone-800 shadow-xl h-fit transition-all ${isOccupied ? 'opacity-80 border-red-200' : ''}`}>
          <CardHeader className={`${isOccupied ? 'bg-red-50' : 'bg-stone-900'} ${isOccupied ? 'text-red-900' : 'text-white'} rounded-t-xl transition-colors`}>
            <CardTitle>{isOccupied ? "Zone Fully Booked" : "Reserve a Spot"}</CardTitle>
            <CardDescription className={isOccupied ? 'text-red-700' : 'text-stone-400'}>
               {isOccupied ? "Please select another zone or check back later." : "Select duration below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" disabled={isOccupied}>2 Hrs</Button>
                    <Button variant="outline" disabled={isOccupied}>4 Hrs</Button>
                    <Button variant="outline" disabled={isOccupied}>Day Pass</Button>
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t p-6 bg-stone-50 dark:bg-stone-900 rounded-b-xl">
            <Button 
                className={`w-full h-12 text-lg ${isOccupied ? 'bg-stone-300' : 'bg-teal-600 hover:bg-teal-700'}`} 
                disabled={isOccupied}
            >
                {isOccupied ? "Unavailable" : "Book Now"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-lg shadow-sm">
            {icon}
            <div><h4 className="font-semibold text-sm text-stone-900 dark:text-stone-200">{title}</h4><p className="text-xs text-stone-500">{desc}</p></div>
        </div>
    )
}