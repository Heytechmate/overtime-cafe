"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CalendarDays } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Reservations</h1>
        <p className="text-stone-500">Manage incoming bookings for Gaming & Pods.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent List</CardTitle></CardHeader>
        <CardContent>
          {bookings.length === 0 ? <p className="text-stone-500 italic py-8 text-center">No bookings found yet.</p> : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg bg-white hover:border-teal-200 transition-all">
                  <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="bg-stone-100 p-3 rounded-full"><Users className="w-5 h-5 text-stone-600"/></div>
                    <div>
                      <p className="font-bold text-stone-900">{b.userName || "Guest"}</p>
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                         <CalendarDays className="w-3 h-3" /> {b.date}
                         <Clock className="w-3 h-3 ml-2" /> {b.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 md:mt-0 w-full md:w-auto justify-end">
                     <Badge variant="outline" className="capitalize">{b.facility}</Badge>
                     <Badge className="bg-teal-600">Confirmed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}