"use client";

import { useState, useEffect } from "react";
import { collection, query, where, addDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFacilityStatus } from "@/hooks/useFacilityStatus";

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function GamingPage() {
  const { status, loading } = useFacilityStatus("gaming");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  
  // NEW: Local Smart Check
  const [isLocallyReserved, setIsLocallyReserved] = useState(false);

  const timeSlots = ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"];

  useEffect(() => {
    // Check if we are physically in a booked slot right now
    const checkTime = () => {
      const now = new Date();
      if (formatDate(now) !== formatDate(selectedDate)) {
        setIsLocallyReserved(false); // Only relevant if viewing today
        return;
      }
      
      const currentHour = now.getHours();
      const isActive = bookedSlots.some(slot => {
         const [time, modifier] = slot.split(' ');
         let [hours] = time.split(':');
         let h = parseInt(hours);
         if (hours === '12') h = 0;
         if (modifier === 'PM') h += 12;
         // 2 Hour Slots
         return currentHour >= h && currentHour < h + 2;
      });
      setIsLocallyReserved(isActive);
    };
    checkTime();
  }, [bookedSlots, selectedDate]);


  // Fetch Games
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "gaming"), (d) => d.exists() && setGames(d.data().titles || []));
    return () => unsub();
  }, []);

  // Fetch Bookings
  useEffect(() => {
    const dateStr = formatDate(selectedDate);
    const q = query(collection(db, "bookings"), where("date", "==", dateStr));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookedSlots(snapshot.docs.map(doc => doc.data().time));
    });
    return () => unsub();
  }, [selectedDate]);

  const handleBooking = async () => {
    if (!selectedTime || !userName) return;
    setIsBooking(true);
    try {
      await addDoc(collection(db, "bookings"), {
        date: formatDate(selectedDate),
        time: selectedTime,
        userName: userName,
        facility: "gaming",
        createdAt: new Date(),
        status: "confirmed"
      });
      alert("Booking Confirmed!");
      setSelectedTime(null);
      setUserName("");
    } catch (e) {
      console.error(e);
      alert("Failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Logic: It is BUSY if Database says Busy OR Local Schedule says Busy
  const isBusy = status?.ps5_available === false || isLocallyReserved;

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto mb-12">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-4 inline-block">← Back to Hub</Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-stone-900">Gaming Lounge</h1>
            <p className="text-stone-500 mt-2">PS5 Pro • 4K 120Hz Screens • Soundproof Zone</p>
          </div>
          
          {loading ? (
             <Badge className="bg-stone-200 text-stone-500 animate-pulse">Checking...</Badge>
          ) : (
             <Badge className={`${!isBusy ? 'bg-teal-500' : 'bg-red-500'} text-white px-4 py-1`}>
               {!isBusy ? "Live: Stations Available" : "Live: Currently Occupied"}
             </Badge>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle>Game Library</CardTitle></CardHeader>
            <CardContent>
              {games.length === 0 ? <p className="text-sm text-stone-400">Loading...</p> : (
                <ul className="space-y-2 text-sm text-stone-600">
                  {games.map((g, i) => <li key={i} className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> {g}</li>)}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 border-stone-200 shadow-xl">
          <CardHeader><CardTitle>Reserve a Console</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div className="p-4 border rounded-xl bg-stone-50 text-center">
               <p className="font-medium mb-3 text-sm text-stone-500">Pick a Date</p>
               <input type="date" className="p-2 border rounded-md w-full" 
                 value={formatDate(selectedDate)}
                 onChange={(e) => setSelectedDate(new Date(e.target.value))}
                 min={new Date().toISOString().split('T')[0]}
               />
            </div>
            <div>
              <p className="font-medium mb-3 text-sm text-stone-500">Available Slots</p>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => {
                   const isTaken = bookedSlots.includes(time);
                   return (
                     <Button 
                       key={time} 
                       variant={selectedTime === time ? "default" : "outline"}
                       disabled={isTaken}
                       onClick={() => setSelectedTime(time)}
                       className={isTaken ? "opacity-50 bg-stone-100" : ""}
                     >
                       {time} {isTaken && "(Busy)"}
                     </Button>
                   )
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 border-t p-6 bg-stone-50/50">
             {selectedTime && (
               <div className="w-full flex gap-3">
                 <Input placeholder="Your Name" value={userName} onChange={e => setUserName(e.target.value)} className="bg-white" />
                 <Button className="bg-stone-900" onClick={handleBooking} disabled={isBooking}>
                   {isBooking ? <Loader2 className="animate-spin"/> : "Confirm"}
                 </Button>
               </div>
             )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}