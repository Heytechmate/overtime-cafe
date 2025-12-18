"use client";

import { useState, useEffect } from "react";
import { onSnapshot, collection, query, where, orderBy, updateDoc, doc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Coffee, CheckCircle2, MapPin, Store as StoreIcon, CupSoda, Plus as PlusIcon, Zap, Clock, PlayCircle } from "lucide-react"; 

export default function AdminDashboard() {
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [autoPilot, setAutoPilot] = useState(true);

  useEffect(() => {
    const qOrders = query(
      collection(db, "orders"), 
      where("status", "in", ["Pending", "Preparing"]), 
      orderBy("createdAt", "asc") 
    );
    
    const unsub = onSnapshot(qOrders, (snap) => {
      setLiveOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // Updated Action Handlers
  const startPreparing = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: "Preparing" });
  };

  const markOrderReady = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: "Ready" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Live Kitchen</h1>
          <p className="text-stone-500 mt-1">Real-time order management.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-full shadow-sm">
           <Zap className={`w-4 h-4 ${autoPilot ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
           <span className="text-xs font-bold text-stone-600">Auto-Pilot</span>
           <Switch checked={autoPilot} onCheckedChange={setAutoPilot} className="scale-75" />
        </div>
      </div>

      {/* KITCHEN QUEUE */}
      <Card className="border-stone-200 shadow-sm bg-stone-50/50 flex flex-col h-[calc(100vh-180px)]"> 
         <CardHeader className="pb-3 border-b bg-white rounded-t-xl shrink-0 flex flex-row items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-stone-100 p-2 rounded-lg"><Coffee className="w-5 h-5 text-stone-900"/></div>
             <div>
               <CardTitle className="text-lg">Incoming Orders</CardTitle>
               <CardDescription>Oldest orders appear first.</CardDescription>
             </div>
           </div>
           <Badge variant="secondary" className="bg-stone-900 text-white px-3 py-1 text-sm">{liveOrders.length} Pending</Badge>
         </CardHeader>
         
         <CardContent className="p-4 overflow-y-auto flex-1 space-y-3">
           {liveOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-stone-400">
               <div className="bg-white p-6 rounded-full shadow-sm mb-4"><Coffee className="w-12 h-12 opacity-20" /></div>
               <p className="text-lg font-medium text-stone-500">Kitchen is Clear</p>
               <p className="text-sm">Waiting for new orders...</p>
             </div>
           ) : (
             liveOrders.map((order) => (
               <div key={order.id} className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 relative overflow-hidden group transition-all ${order.status === 'Preparing' ? 'border-amber-300 shadow-md ring-1 ring-amber-200' : 'border-stone-200 hover:border-teal-400'}`}>
                 
                 {/* Status Indicator Stripe */}
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${order.status === 'Preparing' ? 'bg-amber-500 animate-pulse' : 'bg-stone-300 group-hover:bg-teal-500'}`} />

                 <div className="flex-1">
                   {/* Card Header */}
                   <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
                     <div className="flex items-center gap-2">
                       <span className="font-mono text-xs font-bold text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded">#{order.orderNumber}</span>
                       <span className="font-bold text-stone-900 text-base">{order.userName}</span>
                       
                       {/* STATUS BADGE */}
                       {order.status === 'Preparing' && (
                         <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] animate-pulse">
                           PREPARING...
                         </Badge>
                       )}
                     </div>
                     {order.deliveryMethod === "delivery" ? (
                       <Badge variant="secondary" className="bg-amber-50 text-amber-800 border-amber-200 flex gap-1 items-center px-2 py-0.5 h-6">
                         <MapPin size={10} /> <span className="font-bold text-[10px]">Desk {order.deskLocation}</span>
                       </Badge>
                     ) : (
                       <Badge variant="outline" className="text-stone-500 border-stone-300 flex gap-1 items-center px-2 py-0.5 h-6 bg-stone-50">
                         <StoreIcon size={10} /> <span className="font-bold text-[10px]">Pickup</span>
                       </Badge>
                     )}
                   </div>

                   {/* Items List */}
                   <div className="space-y-2 pl-1">
                     {order.items.map((item: any, i: number) => (
                       <div key={i} className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                           <span className="font-black text-stone-900 text-xs bg-stone-100 w-6 h-6 flex items-center justify-center rounded-md shrink-0">{item.qty}</span>
                           <span className="font-bold text-stone-800 text-sm">{item.name}</span>
                           {item.selectedSize && (
                             <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-stone-200 text-stone-500 bg-stone-50 shadow-sm">
                               <CupSoda size={8} className="mr-1"/> {item.selectedSize.name}
                             </Badge>
                           )}
                         </div>
                         {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                           <div className="pl-9 flex flex-wrap gap-1">
                             {item.selectedAddOns.map((addon: any, idx: number) => (
                               <span key={idx} className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center font-medium">
                                 <PlusIcon size={8} className="mr-0.5" /> {addon.name}
                               </span>
                             ))}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 {/* Right Actions: Workflow Logic */}
                 <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:border-l md:border-stone-100 md:pl-4 min-w-[120px]">
                    <div className="text-right hidden md:block">
                       <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Time</p>
                       <div className="flex items-center gap-1 justify-end text-stone-500 font-mono text-[10px] mt-0.5">
                          <Clock size={10} /> <span>Just now</span>
                       </div>
                    </div>
                    
                    {/* BUTTON WORKFLOW: Start -> Ready */}
                    {order.status === "Pending" ? (
                      <Button 
                        size="sm" 
                        onClick={() => startPreparing(order.id)} 
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 w-full sm:w-auto shadow-sm text-xs flex items-center gap-2 transition-all active:scale-95"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Prep
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => markOrderReady(order.id)} 
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-9 px-4 w-full sm:w-auto shadow-sm text-xs flex items-center gap-2 transition-all active:scale-95 animate-in zoom-in duration-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Ready
                      </Button>
                    )}
                 </div>
               </div>
             ))
           )}
         </CardContent>
      </Card>
    </div>
  );
}