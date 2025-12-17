"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Store, Lock, Unlock, Loader2, DollarSign, ShoppingBag, Users, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [statusLoading, setStatusLoading] = useState(false);
  const [storeStatus, setStoreStatus] = useState({
    isOpen: true,
    message: "Open Now."
  });

  // Listen to Store Status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "storeStatus"), (doc) => {
      if (doc.exists()) {
        setStoreStatus(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  // Handle Status Update
  const handleUpdateStatus = async (newIsOpen: boolean) => {
    setStatusLoading(true);
    try {
      let newMessage = storeStatus.message;
      if (!newIsOpen && newMessage.includes("Open")) newMessage = "Closed for Prayers. Back at 1:30 PM.";
      if (newIsOpen && newMessage.includes("Closed")) newMessage = "Open Now.";

      const newStatus = { isOpen: newIsOpen, message: newMessage };
      await setDoc(doc(db, "settings", "storeStatus"), newStatus);
    } catch (error) {
      console.error("Status update failed", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleMessageChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      await setDoc(doc(db, "settings", "storeStatus"), storeStatus);
      alert("Status message updated!");
    } catch (error) { console.error(error); } finally { setStatusLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Overview</h1>
          <p className="text-stone-500 mt-1">Welcome back. Here is what's happening today.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex border-stone-300">
          <AlertCircle className="w-4 h-4 mr-2" /> Help & Support
        </Button>
      </div>

      {/* KEY METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={<DollarSign/>} label="Total Revenue" value="LKR 45,200" sub="Today" />
        <StatsCard icon={<ShoppingBag/>} label="Open Orders" value="12" sub="Kitchen" />
        <StatsCard icon={<Users/>} label="Active Bookings" value="5" sub="Pods & Space" />
        <StatsCard icon={<AlertTriangle className="text-amber-500"/>} label="Low Stock" value="2 Items" sub="Restock needed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Store Control (Now takes prominent space) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-2 transition-all ${storeStatus.isOpen ? 'border-teal-100 bg-teal-50/30' : 'border-red-100 bg-red-50/30'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-xl ${storeStatus.isOpen ? 'text-teal-900' : 'text-red-900'}`}>
                <Store className="w-6 h-6"/> {storeStatus.isOpen ? "We are OPEN" : "We are CLOSED"}
              </CardTitle>
              <CardDescription>Control your café's global availability status here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className={`flex-1 h-16 text-lg ${storeStatus.isOpen ? 'bg-teal-600 hover:bg-teal-700' : 'bg-white text-stone-500 hover:bg-stone-100 shadow-sm border'}`}
                  onClick={() => handleUpdateStatus(true)}
                  disabled={statusLoading}
                >
                  {statusLoading ? <Loader2 className="animate-spin"/> : <Unlock className="mr-2"/>} Open Café
                </Button>
                <Button 
                  size="lg" 
                  className={`flex-1 h-16 text-lg ${!storeStatus.isOpen ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-stone-500 hover:bg-stone-100 shadow-sm border'}`}
                  onClick={() => handleUpdateStatus(false)}
                  disabled={statusLoading}
                >
                   {statusLoading ? <Loader2 className="animate-spin"/> : <Lock className="mr-2"/>} Close Café
                </Button>
              </div>

              <form onSubmit={handleMessageChange} className="space-y-3 pt-4 border-t border-stone-200/50">
                <Label className="text-xs font-semibold uppercase text-stone-500">Live Homepage Message</Label>
                <div className="flex gap-2">
                  <Input 
                    value={storeStatus.message}
                    onChange={(e) => setStoreStatus(prev => ({...prev, message: e.target.value}))}
                    className="bg-white"
                  />
                  <Button type="submit" variant="secondary">Update Text</Button>
                </div>
              </form>

            </CardContent>
          </Card>
        </div>

        {/* Right: Quick Actions or Other details */}
        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start w-full">Create Booking</Button>
                <Button variant="outline" className="justify-start w-full">View Members</Button>
                <Button variant="outline" className="justify-start w-full">End of Day Report</Button>
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}

// Simple Helper Component for Stats
function StatsCard({ icon, label, value, sub }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <div className="text-stone-400">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-stone-900">{value}</div>
        <p className="text-xs text-stone-500 mt-1">{sub}</p>
      </CardContent>
    </Card>
  )
}