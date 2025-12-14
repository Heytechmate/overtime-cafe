"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, BookOpen, Paintbrush, ArrowLeft, Loader2, Star, Sparkles } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  tags: string[];
  isRecommended?: boolean;
  rating?: number;
  reviewCount?: number;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu"));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        setMenuItems(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredItems = menuItems.filter(item => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Recommended") return item.isRecommended;
    return item.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-6 inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight">The Menu</h1>
            <p className="text-stone-500 mt-2">Fuel for your work, art, and rest.</p>
          </div>
          <Button className="bg-stone-900 hidden sm:flex">My Order</Button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-3 mb-10 max-w-6xl mx-auto overflow-x-auto pb-2 scrollbar-hide">
        <CategoryBtn label="All" icon={<Coffee className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
        <CategoryBtn label="Recommended" icon={<Sparkles className="w-4 h-4 mr-2 text-amber-500"/>} active={activeCategory} onClick={setActiveCategory} />
        <CategoryBtn label="Beverage" icon={<Coffee className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
        <CategoryBtn label="Snack" icon={<BookOpen className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
        <CategoryBtn label="Creative" icon={<Paintbrush className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="flex justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredItems.map((item) => (
            <Card key={item.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col relative">
              
              {/* Recommended Badge */}
              {item.isRecommended && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-amber-400 hover:bg-amber-500 text-black font-semibold shadow-sm gap-1">
                    <Sparkles className="w-3 h-3" /> Chef's Choice
                  </Badge>
                </div>
              )}

              <div className="h-48 bg-stone-200 w-full object-cover group-hover:scale-105 transition-transform duration-500" /> 
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <span className="font-bold text-stone-700 whitespace-nowrap ml-2">{item.price}</span>
                </div>
                
                {/* Rating Row */}
                <div className="flex items-center gap-2 mt-1">
                   {item.rating ? (
                     <div className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                       <Star className="w-3 h-3 mr-1 fill-amber-600" />
                       {item.rating} <span className="text-stone-400 ml-1">({item.reviewCount})</span>
                     </div>
                   ) : (
                     <span className="text-xs text-stone-400">New Item</span>
                   )}
                </div>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {item.tags?.map(tag => (
                     <Badge key={tag} variant="secondary" className="text-xs bg-stone-100 text-stone-600">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full bg-stone-800 text-white hover:bg-stone-700">Add to Order</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryBtn({ label, icon, active, onClick }: any) {
  const isActive = active === label;
  return (
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      onClick={() => onClick(label)}
      className={`rounded-full ${isActive ? "bg-stone-200 hover:bg-stone-300 text-stone-800" : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"}`}
    >
      {icon} {label}
    </Button>
  )
}