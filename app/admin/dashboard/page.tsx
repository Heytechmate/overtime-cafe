"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch"; // Ensure you have this or use a standard checkbox
import { Store, Gamepad2, Mic, Users, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, message: "" });
  const [gamingStatus, setGamingStatus] = useState({ ps5_available: true });
  const [autoPilot, setAutoPilot] = useState(true); // NEW: Toggle for automation
  const [activeBooking, setActiveBooking] = useState<any>(null);

  // 1. Listen to Status
  useEffect(() => {
    const unsub1 = onSnapshot(doc(db, "settings", "storeStatus"), (d) => d.exists() && setStoreStatus(d.data() as any));
    const unsub2 = onSnapshot(doc(db, "facilities", "gaming"), (d) => d.exists() && setGamingStatus(d.data() as any));
    return () => { unsub1(); unsub2(); };
  }, []);

  // 2. AUTO-PILOT LOGIC (The Brain)
  useEffect(() => {
    if (!autoPilot) return;

    // Helper: Parse time string "10:00 AM" to hours (0-23)
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      let h = parseInt(hours);
      if (hours === '12') h = 0;
      if (modifier === 'PM') h += 12;
      return h;
    };

    // Check Schedule
    const checkSchedule = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentHour = now.getHours();

      // Fetch Today's Bookings
      const q = query(collection(db, "bookings"), where("date", "==", todayStr));
      const unsub = onSnapshot(q, (snapshot) => {
         let foundActive = null;
         
         snapshot.docs.forEach(doc => {
            const booking = doc.data();
            const startHour = parseTime(booking.time);
            // ASSUMPTION: Slots are 2 hours long
            const endHour = startHour + 2; 

            if (currentHour >= startHour && currentHour < endHour) {
               foundActive = booking;
            }
         });

         setActiveBooking(foundActive);

         // AUTO-UPDATE DATABASE
         if (foundActive && gamingStatus.ps5_available) {
            console.log("Auto-Pilot: Marking as Occupied due to booking");
            setDoc(doc(db, "facilities", "gaming"), { ps5_available: false }, { merge: true });
         } 
         else if (!foundActive && !gamingStatus.ps5_available) {
             // Only free it up if it was occupied, and we found NO active bookings
             // NOTE: You might want to remove this 'else' if you want manual control to keep it busy even if no booking
             console.log("Auto-Pilot: Marking as Available (No Booking)");
             setDoc(doc(db, "facilities", "gaming"), { ps5_available: true }, { merge: true });
         }
      });
      return () => unsub();
    };

    checkSchedule();
    
    // Run check every 60 seconds
    const interval = setInterval(checkSchedule, 60000); 
    return () => clearInterval(interval);

  }, [autoPilot, gamingStatus.ps5_available]); // Re-run if status or toggle changes


  // Toggle Functions
  const toggleStore = async (isOpen: boolean) => {
    await setDoc(doc(db, "settings", "storeStatus"), { 
      isOpen, 
      message: isOpen ? "Open Now." : "Closed for the day." 
    }, { merge: true });
  };

  const togglePS5 = async () => {
    const newVal = !gamingStatus.ps5_available;
    // If we manually toggle, we might want to temporarily disable auto-pilot? 
    // For now, let's just force the update.
    await setDoc(doc(db, "facilities", "gaming"), { ps5_available: newVal }, { merge: true });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-stone-900">Live Operations</h1>
           <p className="text-sm text-stone-500">Real-time control center</p>
        </div>
        <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-lg border">
           <Zap className={`w-4 h-4 ${autoPilot ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
           <span className="text-xs font-medium text-stone-600">Auto-Pilot</span>
           <Switch checked={autoPilot} onCheckedChange={setAutoPilot} className="scale-75" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Toggle */}
        <Card className={`${storeStatus.isOpen ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5"/> {storeStatus.isOpen ? "Store is OPEN" : "Store is CLOSED"}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex gap-2">
               <Button onClick={() => toggleStore(true)} disabled={storeStatus.isOpen} className="bg-teal-600 flex-1">Open Up</Button>
               <Button onClick={() => toggleStore(false)} disabled={!storeStatus.isOpen} variant="destructive" className="flex-1">Close Down</Button>
             </div>
             <p className="mt-3 text-xs font-mono bg-white/50 p-2 rounded">Message: "{storeStatus.message}"</p>
          </CardContent>
        </Card>

        {/* Gaming Toggle */}
        <Card className="relative overflow-hidden">
          {activeBooking && (
             <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-bl">
                RESERVED: {activeBooking.userName}
             </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2"><Gamepad2 className="w-5 h-5"/> Gaming Station</CardTitle>
            <CardDescription>
               {autoPilot ? "Managed automatically by schedule." : "Manual control enabled."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
             <div>
               <p className={`text-xl font-bold ${gamingStatus.ps5_available ? "text-teal-600" : "text-red-600"}`}>
                 {gamingStatus.ps5_available ? "Available" : "Occupied"}
               </p>
               <p className="text-xs text-stone-400">Updates website instantly</p>
             </div>
             <Button onClick={togglePS5} variant={gamingStatus.ps5_available ? "outline" : "destructive"}>
               {gamingStatus.ps5_available ? "Mark Busy" : "Free Up"}
             </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Links */}
      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mt-8">Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <QuickLink href="/admin/dashboard/bookings" title="View Bookings" icon={<Users className="w-4 h-4"/>} />
         <QuickLink href="/admin/dashboard/games" title="Game Library" icon={<Gamepad2 className="w-4 h-4"/>} />
         <QuickLink href="/admin/dashboard/planner" title="Holiday Planner" icon={<Mic className="w-4 h-4"/>} />
      </div>
    </div>
  );
}

function QuickLink({ href, title, icon }: any) {
  return (
    <Link href={href}>
      <Card className="hover:bg-stone-50 transition-colors cursor-pointer border-stone-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white border rounded-full text-stone-600">{icon}</div>
             <span className="font-medium text-sm text-stone-700">{title}</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-stone-400" />
        </CardContent>
      </Card>
    </Link>
  )
}