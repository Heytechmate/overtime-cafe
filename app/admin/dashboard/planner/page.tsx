"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X } from "lucide-react";

export default function PlannerPage() {
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (doc) => {
       if(doc.exists()) setClosedDates(doc.data().closedDates || []);
    });
    return () => unsub();
  }, []);

  const toggleDate = async () => {
    if(!dateInput) return;
    let updated;
    if (closedDates.includes(dateInput)) {
      updated = closedDates.filter(d => d !== dateInput); 
    } else {
      updated = [...closedDates, dateInput]; 
    }
    await setDoc(doc(db, "settings", "store"), { closedDates: updated }, { merge: true });
    setDateInput("");
  };

  const removeDate = async (dateStr: string) => {
     const updated = closedDates.filter(d => d !== dateStr);
     await setDoc(doc(db, "settings", "store"), { closedDates: updated }, { merge: true });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Holiday Planner</h1>
        <p className="text-stone-500">Block specific dates so customers cannot make bookings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarIcon className="w-5 h-5"/> Manage Closures</CardTitle>
          <CardDescription>Select dates to mark the store as CLOSED.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex gap-4 items-end bg-stone-50 p-4 rounded-lg border">
             <div className="space-y-2 flex-1">
               <label className="text-sm font-medium text-stone-700">Select Date</label>
               <input 
                 type="date" 
                 className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                 onChange={(e) => setDateInput(e.target.value)}
                 value={dateInput}
               />
             </div>
             <Button onClick={toggleDate} className="bg-stone-900" disabled={!dateInput}>
               {closedDates.includes(dateInput) ? "Open Store" : "Close Store"}
             </Button>
           </div>

           <div>
             <h4 className="text-sm font-bold mb-3 text-stone-400 uppercase tracking-wider">Upcoming Closures</h4>
             <div className="flex flex-wrap gap-2">
               {closedDates.length === 0 ? <p className="text-sm text-stone-400 italic">No closures planned.</p> : closedDates.map(date => (
                 <Badge key={date} variant="secondary" className="px-3 py-1.5 flex gap-2 items-center bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                   {date}
                   <X className="w-3 h-3 cursor-pointer" onClick={() => removeDate(date)} />
                 </Badge>
               ))}
             </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}