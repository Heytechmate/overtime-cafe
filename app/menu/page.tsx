"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import Auth
import { db, auth } from "@/lib/firebase"; // Import Auth
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link"; // Import Link

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Track User

  useEffect(() => {
    // 1. Check if user is logged in
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // 2. Fetch Menu
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

  const categories = ["Beverage", "Snack", "Productivity", "Creative"];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans pb-20">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
        
        {/* ✅ SMART BACK BUTTON */}
        {user ? (
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-stone-600 hover:text-stone-900">
              <LayoutDashboard size={18} /> Back to Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/">
             <Button variant="ghost" className="gap-2 text-stone-600">
               <ArrowLeft size={18} /> Home
             </Button>
          </Link>
        )}

        <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100">
          Hey Tech <span className="text-teal-600">Menu</span>
        </h1>
        
        <div className="w-10"></div> {/* Spacer for alignment */}
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-12">
        {loading ? (
          <p className="text-center text-stone-500 mt-20">Loading menu...</p>
        ) : (
          categories.map((category) => {
            const categoryItems = menuItems.filter((item) => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 border-l-4 border-teal-600 pl-4">
                  {category}s
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-stone-900 overflow-hidden group">
                      <div className="h-2 bg-stone-100 dark:bg-stone-800 group-hover:bg-teal-600 transition-colors" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
                              {item.name}
                              {item.isRecommended && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[10px]">
                                  Chef's Choice
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">{item.description}</CardDescription>
                          </div>
                          <span className="font-bold text-lg text-teal-700 dark:text-teal-400">
                            {item.price}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.tags && item.tags.map((tag: string, index: number) => (
                            <span key={index} className="text-[10px] uppercase font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded dark:bg-stone-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {/* ✅ ORDER BUTTON (Functionality to be added next step) */}
                        <Button className="w-full bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100">
                           Add to Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}