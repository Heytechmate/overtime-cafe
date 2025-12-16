"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, BookOpen, Paintbrush, ArrowLeft, Loader2, Star, Sparkles, LayoutGrid, List, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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
  
  // Default view is "list" for mobile friendliness
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
    <div className="min-h-screen bg-stone-50 p-4 md:p-12 font-sans relative">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-6 inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">The Menu</h1>
            <p className="text-stone-500 mt-2">Fuel for your work, art, and rest.</p>
          </div>
          <Button className="bg-stone-900 w-full md:w-auto text-white">My Order</Button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-6xl mx-auto items-start md:items-center justify-between">
        
        {/* Categories Filter */}
        <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto mask-gradient">
          <CategoryBtn label="All" icon={<Coffee className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
          <CategoryBtn label="Recommended" icon={<Sparkles className="w-4 h-4 mr-2 text-amber-500"/>} active={activeCategory} onClick={setActiveCategory} />
          <CategoryBtn label="Beverage" icon={<Coffee className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
          <CategoryBtn label="Snack" icon={<BookOpen className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
          <CategoryBtn label="Creative" icon={<Paintbrush className="w-4 h-4 mr-2"/>} active={activeCategory} onClick={setActiveCategory} />
        </div>

        {/* View Toggle */}
        <div className="flex md:hidden bg-stone-200/50 p-1 rounded-full self-end">
          <button 
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              viewMode === "grid" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              viewMode === "list" ? "bg-white shadow-sm text-stone-900" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className={cn(
          "max-w-6xl mx-auto pb-24 transition-all duration-500",
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3" 
        )}>
          {filteredItems.map((item) => (
            viewMode === "list" ? (
              // --- SMART LIST CARD ---
              <Card key={item.id} className="md:hidden flex flex-row overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-3 gap-4 items-center bg-white group">
                 <div 
                   onClick={() => setSelectedItem(item)}
                   className="h-24 w-24 bg-stone-200 rounded-xl flex-shrink-0 relative overflow-hidden active:scale-95 transition-transform cursor-pointer"
                 >
                    <div className="absolute inset-0 bg-stone-200" />
                    {item.isRecommended && (
                       <div className="absolute top-0 right-0 p-1 bg-amber-400 rounded-bl-lg z-10">
                          <Sparkles className="w-3 h-3 text-black" />
                       </div>
                    )}
                 </div>
                 
                 <div className="flex-1 min-w-0 flex flex-col justify-between h-24 py-1">
                    <div onClick={() => setSelectedItem(item)} className="cursor-pointer">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-stone-900 truncate text-base">{item.name}</h3>
                         <span className="font-bold text-teal-700 text-sm whitespace-nowrap ml-2">{item.price}</span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-1 mt-1 leading-tight">{item.description}</p>
                      <span className="text-[10px] text-stone-400 underline decoration-stone-300 mt-1 inline-block">More details</span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-1">
                        <div className="flex items-center gap-2">
                           {item.rating && (
                             <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                               <Star className="w-2.5 h-2.5 mr-1 fill-amber-600" />
                               {item.rating}
                             </div>
                           )}
                        </div>
                        <Button size="icon" className="h-8 w-8 rounded-full bg-stone-900 text-white hover:bg-teal-600 transition-colors shadow-sm active:scale-90">
                          <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                 </div>
              </Card>
            ) : (
              // --- GRID CARD ---
              <Card 
                key={item.id} 
                className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col relative bg-white cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
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
                  <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button className="w-full bg-stone-800 text-white hover:bg-stone-700 transition-colors" onClick={(e) => e.stopPropagation()}>
                    Add to Order
                  </Button>
                </CardFooter>
              </Card>
            )
          ))}

          {/* Desktop Fallback for List Mode */}
          {viewMode === "list" && filteredItems.map((item) => (
             <div key={`desktop-${item.id}`} className="hidden md:block">
                 <Card 
                    className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col relative bg-white cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                 >
                     <div className="h-48 bg-stone-200 w-full" />
                     <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <p className="text-stone-500 text-sm">{item.description}</p>
                     </CardHeader>
                     <CardFooter>
                       <Button className="w-full">Add to Order</Button>
                     </CardFooter>
                 </Card>
             </div>
          ))}
        </div>
      )}

      {/* --- CENTRALIZED POPUP MODAL --- */}
      <AnimatePresence>
        {selectedItem && (
          // WRAPPER: Fixed overlay that centers its children
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* BACKDROP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"
            />
            
            {/* MODAL CARD */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full md:max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Header */}
              <div className="h-56 md:h-72 bg-stone-200 relative shrink-0">
                <div className="absolute inset-0 bg-stone-300" />
                {selectedItem.isRecommended && (
                  <div className="absolute top-4 left-4 z-20">
                     <Badge className="bg-amber-400 text-black border-none shadow-md">
                        <Sparkles className="w-3 h-3 mr-1" /> Recommended
                     </Badge>
                  </div>
                )}
              </div>

              {/* Scrollable Content Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-900">{selectedItem.name}</h2>
                  <span className="text-xl font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-lg">{selectedItem.price}</span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                   {selectedItem.rating && (
                     <div className="flex items-center text-sm font-semibold text-amber-600">
                       <Star className="w-4 h-4 mr-1 fill-amber-600" />
                       {selectedItem.rating}
                     </div>
                   )}
                   <span className="text-stone-300">|</span>
                   <span className="text-stone-500 text-sm font-medium">{selectedItem.category}</span>
                </div>

                <p className="text-stone-600 leading-relaxed mb-6 text-base md:text-lg">
                  {selectedItem.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedItem.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="border-stone-200 text-stone-500 px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Footer Button */}
              <div className="p-6 pt-2 border-t border-stone-100 bg-white pb-6">
                 <Button className="w-full bg-stone-900 hover:bg-teal-600 text-white h-14 text-lg rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-between px-8">
                    <span>Add to Order</span>
                    <span className="opacity-80">{selectedItem.price}</span>
                 </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function CategoryBtn({ label, icon, active, onClick }: any) {
  const isActive = active === label;
  return (
    <Button 
      variant={isActive ? "secondary" : "ghost"} 
      onClick={() => onClick(label)}
      className={cn(
        "rounded-full whitespace-nowrap transition-all", 
        isActive ? "bg-stone-900 text-white hover:bg-stone-800 shadow-md" : "text-stone-500 hover:text-stone-900 hover:bg-stone-200"
      )}
    >
      {icon} {label}
    </Button>
  )
}