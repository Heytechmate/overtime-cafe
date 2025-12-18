"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, updateDoc, increment } from "firebase/firestore"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Coffee, LogOut, ShoppingBag, Check, Clock, ChefHat, Bell, History, MapPin, Store, CupSoda, Plus as PlusIcon, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";

// --- COMPACT LIQUID COMPONENT (Teal) ---
const LiquidProgressBar = ({ value, max }: { value: number, max: number }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="relative w-full h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner border border-stone-200 group">
      <style jsx>{`
        @keyframes waveMove {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        @keyframes bubbleRise {
          0% { bottom: -5px; opacity: 0; transform: translateX(0); }
          50% { opacity: 1; }
          100% { bottom: 100%; opacity: 0; transform: translateX(3px); }
        }
        .liquid-wave {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='10' viewBox='0 0 20 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 V5 Q5 0 10 5 T20 5 V10 H0 Z' fill='rgba(255,255,255,0.3)' fill-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 20px 10px;
          animation: waveMove 1s linear infinite;
        }
        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          animation: bubbleRise 3s infinite ease-in;
        }
      `}</style>

      {/* The Liquid Body (Teal) */}
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-500 transition-all duration-1000 ease-out flex items-center relative"
        style={{ width: `${percentage}%` }}
      >
         {/* Top Surface Wave */}
         <div className="absolute top-0 left-0 right-0 h-full liquid-wave opacity-60" />
         
         {/* Tiny Bubbles */}
         <div className="absolute inset-0 overflow-hidden">
            <div className="bubble w-0.5 h-0.5 left-[20%]" style={{ animationDelay: '0s' }} />
            <div className="bubble w-1 h-1 left-[50%]" style={{ animationDelay: '1.5s' }} />
            <div className="bubble w-0.5 h-0.5 left-[80%]" style={{ animationDelay: '0.5s' }} />
         </div>

         {/* Shine Line */}
         <div className="absolute top-0.5 left-0 right-0 h-[1px] bg-white/30 rounded-full mx-1" />
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [coffeeGoal, setCoffeeGoal] = useState(10);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    getDoc(doc(db, "settings", "loyalty")).then(snap => { if(snap.exists()) setCoffeeGoal(snap.data().coffeeGoal); });
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push("/auth"); return; }
      setUser(currentUser);
      onSnapshot(doc(db, "users", currentUser.uid), (doc) => setUserData(doc.data()));
      const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      onSnapshot(q, (snapshot) => {
        const allOrders = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setActiveOrders(allOrders.filter((o: any) => ["Pending", "Preparing", "Ready"].includes(o.status)));
        setPastOrders(allOrders.filter((o: any) => ["Collected", "Completed", "Cancelled"].includes(o.status)));
      });
    });
    return () => unsubscribe();
  }, [router]);

  const handleCollected = async (order: any) => {
    const pointsEarned = order.items.reduce((total: number, item: any) => {
      const isCoffee = (item.category === "Beverage") || (/Coffee|Latte|Cappuccino|Espresso/i.test(item.name));
      return isCoffee ? total + (item.qty || 1) : total;
    }, 0);

    try {
      await updateDoc(doc(db, "orders", order.id), { status: "Collected" });
      if (pointsEarned > 0) {
        await updateDoc(doc(db, "users", user.uid), { coffeeCount: increment(pointsEarned) });
        alert(`🎉 Collected! +${pointsEarned} Points`);
      }
    } catch (e) { console.error(e); }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPastOrders = pastOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pastOrders.length / itemsPerPage);

  if (!userData) return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div><h1 className="text-xl font-bold text-stone-900">Hi, {userData.firstName || "Member"} 👋</h1><p className="text-xs text-stone-500 hidden sm:block">Welcome back.</p></div>
         <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="text-stone-400 hover:text-red-500"><LogOut className="w-4 h-4 mr-2"/> Logout</Button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* LOYALTY CARD (Compact & Teal) */}
           <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-50/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                 <div>
                   <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">Coffee Club</p>
                   <h3 className="text-3xl font-extrabold text-teal-900">{userData.coffeeCount || 0}<span className="text-lg text-stone-400 font-medium">/{coffeeGoal}</span></h3>
                 </div>
                 <div className="h-12 w-12 bg-teal-50 rounded-full flex items-center justify-center shadow-sm border border-teal-100"><Coffee className="w-6 h-6 text-teal-600" /></div>
              </div>
              
              {/* COMPACT LIQUID BAR */}
              <LiquidProgressBar value={userData.coffeeCount || 0} max={coffeeGoal} />
              
              <p className="text-xs text-stone-500 mt-3 font-medium flex items-center gap-1.5">
                <Sparkles size={12} className="text-amber-400 fill-amber-400" />
                {Math.max(0, coffeeGoal - (userData.coffeeCount || 0))} more cups until free coffee!
              </p>
           </div>

           {/* ACTIONS */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white h-14 text-base font-bold shadow-md flex items-center justify-between px-6" onClick={() => router.push("/menu")}><span>New Order</span><ShoppingBag className="w-5 h-5 opacity-80" /></Button>
              <Button variant="outline" className="h-14 border-dashed border-stone-300 text-stone-400 hover:text-stone-600 hover:border-stone-400 bg-transparent text-sm">Book Meeting Room</Button>
           </div>

           {/* HISTORY */}
           {pastOrders.length > 0 && (
             <div className="pt-4">
               <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2"><History size={16}/> Recent Orders</h3>
               <div className="grid gap-3">
                 {currentPastOrders.map((order: any) => (
                   <div key={order.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                         <div className="bg-stone-100 h-9 w-9 rounded-lg flex items-center justify-center text-stone-400"><ShoppingBag size={16}/></div>
                         <div><span className="block font-medium text-stone-800 text-sm">{order.items.length} Items</span><span className="text-[10px] text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                      </div>
                      <Badge variant="outline" className="text-stone-400 font-normal text-[10px]">Collected</Badge>
                   </div>
                 ))}
               </div>
               {totalPages > 1 && (
                 <div className="flex justify-between items-center mt-4 pt-2 border-t border-stone-100">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-stone-500 h-8"><ChevronLeft className="w-4 h-4 mr-1" /></Button>
                    <span className="text-xs font-medium text-stone-400">Page {currentPage} of {totalPages}</span>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-stone-500 h-8"><ChevronRight className="w-4 h-4 ml-1" /></Button>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: LIVE ORDER (Same Smart Card) */}
        <div className="lg:col-span-1">
           {activeOrders.length === 0 ? (
             <div className="h-full min-h-[250px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 p-8 text-center">
                <Coffee className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium text-stone-500 text-sm">No active orders</p>
             </div>
           ) : (
             <div className="space-y-6 sticky top-24">
               <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2"><Bell className="w-3 h-3 animate-pulse" /> Live Status</h3>
               {activeOrders.map((order: any) => {
                  const isReady = order.status === 'Ready';
                  const isPrep = order.status === 'Preparing';
                  const step = isReady ? 3 : isPrep ? 2 : 1;
                  return (
                    <Card key={order.id} className={`border-none shadow-xl overflow-hidden transition-all duration-500 ${isReady ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-white"}`}>
                       <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-5">
                             <div>
                               <h2 className={`text-lg font-bold ${isReady ? "text-white" : "text-stone-900"}`}>{isReady ? "Order Ready!" : isPrep ? "Preparing..." : "Order Sent"}</h2>
                               <p className={`text-[10px] mt-1 ${isReady ? "text-teal-100" : "text-stone-500"}`}>#{order.orderNumber} • {order.items.length} Items</p>
                             </div>
                             {order.deliveryMethod === 'delivery' ? <Badge variant="secondary" className="bg-white/20 text-current backdrop-blur-sm text-[10px]"><MapPin size={10} className="mr-1"/> {order.deskLocation}</Badge> : <Badge variant="outline" className="bg-white/20 text-current backdrop-blur-sm border-current/20 text-[10px]"><Store size={10} className="mr-1"/> Pickup</Badge>}
                          </div>
                          {/* Timeline & Items Code (Same as previous, just preserved) */}
                          <div className="flex items-center justify-between mb-6 relative px-2">
                             <div className={`absolute top-1/2 left-0 w-full h-0.5 -z-0 ${isReady ? "bg-teal-500" : "bg-stone-100"}`} />
                             <div className={`absolute top-1/2 left-0 h-0.5 bg-current transition-all duration-1000 -z-0 ${isReady ? "bg-white" : "bg-teal-500"}`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                             <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? (isReady ? "bg-white text-teal-600" : "bg-teal-500 text-white") : "bg-stone-100 text-stone-300"}`}><Clock size={12} /></div>
                             <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? (isReady ? "bg-white text-teal-600" : "bg-teal-500 text-white") : "bg-stone-100 text-stone-300"}`}><ChefHat size={12} className={isPrep ? "animate-bounce" : ""} /></div>
                             <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? "bg-white text-teal-600 scale-125" : "bg-stone-100 text-stone-300"}`}><Check size={12} className={isReady ? "animate-pulse" : ""} /></div>
                          </div>
                          {isReady ? <Button onClick={() => handleCollected(order)} className="w-full bg-white text-teal-700 hover:bg-teal-50 font-bold h-10 shadow-lg text-xs"><Check className="w-3 h-3 mr-2" /> I've Received It</Button> : <p className={`text-center text-[10px] font-medium uppercase tracking-wider ${isReady ? "text-white" : "text-stone-400"}`}>Estimated: 5-10 Mins</p>}
                       </CardContent>
                    </Card>
                  );
               })}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}