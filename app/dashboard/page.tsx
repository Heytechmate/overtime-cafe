"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, updateDoc, increment } from "firebase/firestore"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Coffee, LogOut, ShoppingBag, Check, Clock, ChefHat, Bell, History, MapPin, Store, CupSoda, Plus as PlusIcon, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [coffeeGoal, setCoffeeGoal] = useState(10);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const router = useRouter();

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();

    getDoc(doc(db, "settings", "loyalty")).then(snap => {
      if(snap.exists()) setCoffeeGoal(snap.data().coffeeGoal);
    });

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
      const isCoffee = (item.category === "Beverage") || (/Coffee|Latte/i.test(item.name));
      return isCoffee ? total + (item.qty || 1) : total;
    }, 0);

    await updateDoc(doc(db, "orders", order.id), { status: "Collected" });
    if (pointsEarned > 0) {
      await updateDoc(doc(db, "users", user.uid), { coffeeCount: increment(pointsEarned) });
    }
  };

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPastOrders = pastOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pastOrders.length / itemsPerPage);

  if (!userData) return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  const progress = ((userData.coffeeCount || 0) / coffeeGoal) * 100;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">
      
      {/* Navbar */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
         <div>
            <h1 className="text-xl font-bold text-stone-900">Hi, {userData.firstName || "Member"} 👋</h1>
            <p className="text-xs text-stone-500 hidden sm:block">Welcome to your workspace.</p>
         </div>
         <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="text-stone-400 hover:text-red-500"><LogOut className="w-4 h-4 mr-2"/> Logout</Button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* 1. LOYALTY CARD - LIGHTER VERSION */}
           <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-lg relative overflow-hidden group">
              {/* Subtle light gradient background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-50/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="relative z-10 flex justify-between items-start mb-8">
                 <div>
                   <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                     <Coffee className="w-4 h-4 text-teal-600" /> Coffee Club
                   </p>
                   <h3 className="text-4xl font-extrabold text-teal-900">{userData.coffeeCount || 0}<span className="text-2xl text-stone-400 font-medium">/{coffeeGoal}</span></h3>
                 </div>
                 {/* Lighter Icon Container */}
                 <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center shadow-sm border border-teal-100 group-hover:scale-110 transition-transform">
                   <Coffee className="w-8 h-8 text-teal-600" />
                 </div>
              </div>
              {/* Lighter Progress Bar Track */}
              <Progress value={progress} className="h-3 bg-stone-100" indicatorClassName="bg-gradient-to-r from-teal-400 to-teal-600" />
              <p className="text-sm text-stone-600 mt-4 font-medium flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                {Math.max(0, coffeeGoal - (userData.coffeeCount || 0))} more cups until your free coffee reward!
              </p>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white h-16 text-lg font-bold shadow-md flex items-center justify-between px-8" onClick={() => router.push("/menu")}>
                <span>New Order</span><ShoppingBag className="w-6 h-6 opacity-80" />
              </Button>
              <Button variant="outline" className="h-16 border-dashed border-stone-300 text-stone-400 hover:text-stone-600 hover:border-stone-400 bg-transparent text-base">Book Meeting Room</Button>
           </div>

           {/* 3. HISTORY WITH PAGINATION */}
           {pastOrders.length > 0 && (
             <div className="pt-4">
               <h3 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2"><History size={16}/> Recent Orders</h3>
               
               <div className="grid gap-3">
                 {currentPastOrders.map((order: any) => (
                   <div key={order.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                         <div className="bg-stone-100 h-10 w-10 rounded-lg flex items-center justify-center text-stone-400"><ShoppingBag size={18}/></div>
                         <div>
                           <span className="block font-medium text-stone-800 text-sm">{order.items.length} Items</span>
                           <span className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                      <Badge variant="outline" className="text-stone-400 font-normal">Collected</Badge>
                   </div>
                 ))}
               </div>

               {/* Pagination Controls */}
               {totalPages > 1 && (
                 <div className="flex justify-between items-center mt-4 pt-2 border-t border-stone-100">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      className="text-stone-500"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-xs font-medium text-stone-400">Page {currentPage} of {totalPages}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage === totalPages}
                      className="text-stone-500"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: LIVE ORDER TRACKER */}
        <div className="lg:col-span-1">
           {activeOrders.length === 0 ? (
             <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-stone-200 text-stone-400 p-8 text-center">
                <Coffee className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium text-stone-500">No active orders</p>
                <p className="text-xs mt-1">Your live order status will appear here.</p>
             </div>
           ) : (
             <div className="space-y-6 sticky top-24">
               <h3 className="text-sm font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2">
                 <Bell className="w-4 h-4 animate-pulse" /> Live Status
               </h3>
               {activeOrders.map((order: any) => {
                  const isReady = order.status === 'Ready';
                  const isPrep = order.status === 'Preparing';
                  const step = isReady ? 3 : isPrep ? 2 : 1;

                  return (
                    <Card key={order.id} className={`border-none shadow-xl overflow-hidden transition-all duration-500 ${isReady ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-white"}`}>
                       <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                               <h2 className={`text-xl font-bold ${isReady ? "text-white" : "text-stone-900"}`}>{isReady ? "Order Ready!" : isPrep ? "Preparing..." : "Order Sent"}</h2>
                               <p className={`text-xs mt-1 ${isReady ? "text-teal-100" : "text-stone-500"}`}>#{order.orderNumber} • {order.items.length} Items</p>
                             </div>
                             {order.deliveryMethod === 'delivery' ? (
                               <Badge variant="secondary" className="bg-white/20 text-current backdrop-blur-sm"><MapPin size={10} className="mr-1"/> {order.deskLocation}</Badge>
                             ) : (
                               <Badge variant="outline" className="bg-white/20 text-current backdrop-blur-sm border-current/20"><Store size={10} className="mr-1"/> Pickup</Badge>
                             )}
                          </div>

                          <div className="flex items-center justify-between mb-8 relative px-2">
                             <div className={`absolute top-1/2 left-0 w-full h-0.5 -z-0 ${isReady ? "bg-teal-500" : "bg-stone-100"}`} />
                             <div className={`absolute top-1/2 left-0 h-0.5 bg-current transition-all duration-1000 -z-0 ${isReady ? "bg-white" : "bg-teal-500"}`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
                             <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= 1 ? (isReady ? "bg-white text-teal-600" : "bg-teal-500 text-white") : "bg-stone-100 text-stone-300"}`}><Clock size={14} /></div>
                             <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= 2 ? (isReady ? "bg-white text-teal-600" : "bg-teal-500 text-white") : "bg-stone-100 text-stone-300"}`}><ChefHat size={14} className={isPrep ? "animate-bounce" : ""} /></div>
                             <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= 3 ? "bg-white text-teal-600 scale-125 shadow-lg" : "bg-stone-100 text-stone-300"}`}><Check size={14} className={isReady ? "animate-pulse" : ""} /></div>
                          </div>

                          <div className={`rounded-xl p-4 mb-4 text-sm space-y-2 ${isReady ? "bg-white/10" : "bg-stone-50"}`}>
                             {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center">
                                   <span className={isReady ? "text-teal-50" : "text-stone-600"}>{item.qty}x {item.name}</span>
                                   {item.selectedSize && <span className="text-[10px] opacity-70 border px-1 rounded">{item.selectedSize.name}</span>}
                                </div>
                             ))}
                          </div>

                          {isReady ? (
                            <Button onClick={() => handleCollected(order)} className="w-full bg-white text-teal-700 hover:bg-teal-50 font-bold h-11 shadow-lg animate-in zoom-in">
                               <Check className="w-4 h-4 mr-2" /> I've Received It
                            </Button>
                          ) : (
                            <p className={`text-center text-xs font-medium uppercase tracking-wider ${isReady ? "text-white" : "text-stone-400"}`}>Estimated: 5-10 Mins</p>
                          )}
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