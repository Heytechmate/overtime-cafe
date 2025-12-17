"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Store, Lock, Unlock, Loader2, DollarSign, ShoppingBag, Users, AlertTriangle, Coffee, Mic, Gamepad2, CheckCircle2, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [statusLoading, setStatusLoading] = useState(false);
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, message: "Open Now." });
  
  // NEW: State for Live Orders
  const [liveOrders, setLiveOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubStatus = onSnapshot(doc(db, "settings", "storeStatus"), (doc) => {
      if (doc.exists()) setStoreStatus(doc.data() as any);
    });

    // NEW: Listen for 'Pending' or 'Preparing' orders
    const q = query(
      collection(db, "orders"),
      where("status", "in", ["Pending", "Preparing"]),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    
    const unsubOrders = onSnapshot(q, (snap) => {
      setLiveOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubStatus(); unsubOrders(); };
  }, []);

  const handleUpdateStatus = async (newIsOpen: boolean) => {
    setStatusLoading(true);
    try {
      let newMessage = storeStatus.message;
      if (!newIsOpen && newMessage.includes("Open")) newMessage = "Closed for Prayers. Back at 1:30 PM.";
      if (newIsOpen && newMessage.includes("Closed")) newMessage = "Open Now.";
      await setDoc(doc(db, "settings", "storeStatus"), { isOpen: newIsOpen, message: newMessage });
    } catch (error) { console.error(error); } finally { setStatusLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center py-2">
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Overview</h1>
        <Button variant="outline" size="sm" className="h-7 text-xs border-stone-200">
          <AlertCircle className="w-3 h-3 mr-2" /> Help
        </Button>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard icon={<DollarSign className="w-3.5 h-3.5"/>} label="Revenue" value="LKR 45k" sub="Today" />
        <StatsCard icon={<ShoppingBag className="w-3.5 h-3.5"/>} label="Orders" value={liveOrders.length.toString()} sub="Active" />
        <StatsCard icon={<Users className="w-3.5 h-3.5"/>} label="Bookings" value="5" sub="Active" />
        <StatsCard icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500"/>} label="Stock" value="2 Low" sub="Action" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* COL 1: Store Control */}
        <div className="h-full">
          <Card className={`h-full flex flex-col gap-0 py-0 border transition-all ${storeStatus.isOpen ? 'border-teal-200 bg-teal-50/40' : 'border-red-200 bg-red-50/40'}`}>
            <CardHeader className="px-4 py-3 pb-0">
              <CardTitle className={`flex items-center gap-2 text-base ${storeStatus.isOpen ? 'text-teal-900' : 'text-red-900'}`}>
                <Store className="w-4 h-4"/> {storeStatus.isOpen ? "We are OPEN" : "We are CLOSED"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 flex-grow flex flex-col justify-center gap-3">
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  className={`flex-1 h-9 text-xs font-medium shadow-none ${storeStatus.isOpen ? 'bg-teal-600 hover:bg-teal-700' : 'bg-white text-stone-500 border'}`}
                  onClick={() => handleUpdateStatus(true)}
                  disabled={statusLoading}
                >
                  {statusLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Unlock className="w-3 h-3 mr-2"/>} Open
                </Button>
                <Button 
                  size="sm"
                  className={`flex-1 h-9 text-xs font-medium shadow-none ${!storeStatus.isOpen ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-stone-500 border'}`}
                  onClick={() => handleUpdateStatus(false)}
                  disabled={statusLoading}
                >
                   {statusLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Lock className="w-3 h-3 mr-2"/>} Close
                </Button>
              </div>
              <Input 
                value={storeStatus.message} 
                className="bg-white h-8 text-xs" 
                onChange={(e) => setStoreStatus(prev => ({...prev, message: e.target.value}))}
              />
            </CardContent>
          </Card>
        </div>

        {/* COL 2 & 3: NEW Live Orders Widget (Replaces Quick Actions) */}
        <div className="lg:col-span-2 h-full">
           <Card className="h-full flex flex-col gap-0 py-0 border-stone-200">
             <CardHeader className="px-4 py-3 pb-0 flex flex-row items-center justify-between">
               <CardTitle className="text-sm font-bold text-stone-700 flex items-center gap-2">
                 <Coffee className="w-4 h-4"/> Kitchen Queue
               </CardTitle>
               <Badge variant="secondary" className="text-[10px] h-5">Live Feed</Badge>
             </CardHeader>
             <CardContent className="px-4 py-3 flex-grow flex flex-col gap-2">
                {liveOrders.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-stone-400 text-xs italic bg-stone-50 rounded border border-dashed">
                    No active orders right now.
                  </div>
                ) : (
                  liveOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 rounded bg-white border border-stone-100 shadow-sm">
                       <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">#{order.id.slice(-4)}</span>
                            <Badge className={order.status === 'Preparing' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-stone-100 text-stone-600 hover:bg-stone-100'}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-stone-500">{order.items?.length || 1} items • 2 mins ago</p>
                       </div>
                       <div className="flex gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 bg-amber-50">
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 bg-green-50">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                  ))
                )}
             </CardContent>
           </Card>
        </div>
      </div>

      {/* NEW: Space Occupancy Row */}
      <div className="grid grid-cols-3 gap-3">
         <SpaceCard name="Podcast Studio" icon={<Mic className="w-4 h-4"/>} status="Occupied" until="2:00 PM" />
         <SpaceCard name="Gaming Station" icon={<Gamepad2 className="w-4 h-4"/>} status="Available" />
         <SpaceCard name="Meeting Pod" icon={<Users className="w-4 h-4"/>} status="Available" />
      </div>

    </div>
  );
}

// Sub-components
function StatsCard({ icon, label, value, sub }: any) {
  return (
    <Card className="gap-0 py-0 border-stone-200">
      <CardContent className="p-3 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
            <div className="text-stone-300 scale-90">{icon}</div>
        </div>
        <div>
            <div className="text-lg font-bold text-stone-800 leading-none">{value}</div>
            <p className="text-[10px] text-stone-400 mt-1">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SpaceCard({ name, icon, status, until }: any) {
  const isBusy = status === "Occupied";
  return (
    <Card className={`gap-0 py-0 border-l-4 ${isBusy ? 'border-l-red-500' : 'border-l-teal-500'}`}>
       <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${isBusy ? 'bg-red-50 text-red-500' : 'bg-teal-50 text-teal-500'}`}>
                {icon}
             </div>
             <div>
                <p className="text-xs font-bold text-stone-700">{name}</p>
                <p className={`text-[10px] font-medium ${isBusy ? 'text-red-600' : 'text-teal-600'}`}>
                  {status} {until && `• Until ${until}`}
                </p>
             </div>
          </div>
       </CardContent>
    </Card>
  )
}