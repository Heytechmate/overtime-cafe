"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Coffee, Gift, LogOut, ShoppingBag, BellRing } from "lucide-react";

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [coffeeGoal, setCoffeeGoal] = useState(10);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 1. Request Notification Permission on Load
    if ("Notification" in window) {
      Notification.requestPermission();
    }

    // 2. Fetch Global Settings
    getDoc(doc(db, "settings", "loyalty")).then(snap => {
      if(snap.exists()) setCoffeeGoal(snap.data().coffeeGoal);
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      setUser(currentUser);

      // 3. Listen to User Profile (Name, Points, Tier)
      const unsubUserData = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
        setUserData(doc.data());
      });

      // 4. Listen to Active Orders (For Notifications)
      const q = query(
        collection(db, "orders"), 
        where("userId", "==", currentUser.uid),
        where("status", "in", ["Pending", "Preparing", "Ready"]) 
      );

      const unsubOrders = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setActiveOrders(orders);

        // 🔔 CHECK FOR NOTIFICATIONS
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data();
            if (data.status === "Ready") {
              new Notification("Order Ready! ☕️", { body: "Your coffee is waiting at the counter." });
            } else if (data.status === "Preparing") {
              new Notification("Order Update 👨‍🍳", { body: "Barista is making your order now." });
            }
          }
        });
      });

      return () => {
        unsubUserData();
        unsubOrders();
      };
    });

    return () => unsubscribe();
  }, [router]);

  if (!userData) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  const progress = ((userData.coffeeCount || 0) / coffeeGoal) * 100;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 font-sans p-6 md:p-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Live Name */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">
              Hello, {userData.firstName || "Member"}! 👋
            </h1>
            <div className="flex gap-2 items-center text-stone-500 mt-1">
               <span className="font-mono text-teal-600">{userData.memberId || "Loading ID..."}</span>
               <span>•</span>
               <span className="text-xs uppercase font-bold tracking-wider bg-stone-200 px-2 py-0.5 rounded text-stone-600">
                 {userData.tier || "Member"} Status
               </span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => signOut(auth)} className="text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2"/> Logout
          </Button>
        </div>

        {/* 🔔 Live Active Orders Card (Only shows if you have orders) */}
        {activeOrders.length > 0 && (
          <Card className="bg-teal-50 border-teal-200 shadow-sm animate-in slide-in-from-top-4">
             <CardHeader className="pb-2">
               <CardTitle className="text-teal-900 flex items-center gap-2 text-lg">
                 <BellRing className="w-5 h-5 animate-pulse" /> Live Orders
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {activeOrders.map((order: any) => (
                 <div key={order.id} className="flex justify-between items-center bg-white p-3 rounded-md border border-teal-100 shadow-sm">
                    <div>
                       <p className="font-bold text-stone-800">Order #{order.id.slice(-4)}</p>
                       <p className="text-xs text-stone-500">{order.items?.length || 1} items</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                      order.status === 'Preparing' ? 'bg-amber-100 text-amber-700' : 
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {order.status}
                    </span>
                 </div>
               ))}
             </CardContent>
          </Card>
        )}

        {/* Loyalty Card */}
        <Card className="bg-white dark:bg-stone-950 shadow-lg border-stone-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2"><Coffee className="text-stone-700"/> Coffee Club</span>
              <span className="text-sm font-normal text-stone-500">
                 Goal: {coffeeGoal} cups
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Your Progress</span>
                <span className="text-teal-600">{userData.coffeeCount || 0} / {coffeeGoal}</span>
              </div>
              <Progress 
                value={progress} 
                className="h-4 bg-stone-100" 
                indicatorClassName="bg-teal-500" // This works now with your fixed component!
              /> 
              <p className="text-xs text-stone-400 mt-2 text-center">
                {Math.max(0, coffeeGoal - (userData.coffeeCount || 0))} more cups until your free reward!
              </p>
            </div>

            {(userData.freeCoffees || 0) > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800">You have {userData.freeCoffees} Free Coffee{userData.freeCoffees > 1 ? 's' : ''}!</h3>
                  <p className="text-sm text-amber-700">Show this to the barista to redeem.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* ✅ NAVIGATION FIX: Direct Link to Menu */}
           <Button 
             size="lg" 
             className="w-full bg-stone-900 hover:bg-stone-800 text-white h-14 text-lg"
             onClick={() => router.push("/menu")}
           >
             <ShoppingBag className="mr-2 w-5 h-5"/> Order Food & Drink
           </Button>

           <Card className="flex items-center justify-center text-stone-400 text-sm border-dashed">
             Coming Soon: Booking History
           </Card>
        </div>

      </div>
    </div>
  );
}