"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, runTransaction, doc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Ensure you have this or use standard label
import { 
  ArrowLeft, LayoutDashboard, Minus, Plus, Loader2, CheckCircle2, 
  Search, X, Coffee, Utensils, Zap, Palette, Layers, Sparkles, Heart, Settings,
  MapPin, Store
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Types
type CartItem = {
  cartId: string;
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  selectedSize?: { name: string; price: number };
  selectedAddOns?: { name: string; price: number }[];
};

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Smart Features
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Modals State
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false); // New Checkout Modal
  
  // Checkout Details State
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deskNumber, setDeskNumber] = useState("");

  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const specificCategories = ["Beverage", "Snack", "Productivity", "Creative"];
  const allCategories = ["All", "Favorites", ...specificCategories];
  
  const categoryIcons: any = { 
    "All": <Layers size={16} />,
    "Favorites": <Heart size={16} className="text-red-500 fill-red-500" />,
    "Beverage": <Coffee size={16} />, 
    "Snack": <Utensils size={16} />, 
    "Productivity": <Zap size={16} />, 
    "Creative": <Palette size={16} /> 
  };

  useEffect(() => {
    const savedFavs = localStorage.getItem("ot_favorites");
    if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    const unsubscribe = onSnapshot(collection(db, "menu"), (snapshot) => {
      setMenuItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => { unsubscribe(); unsubAuth(); };
  }, []);

  const toggleFavorite = (itemId: string) => {
    const newFavs = new Set(favorites);
    if (newFavs.has(itemId)) newFavs.delete(itemId);
    else newFavs.add(itemId);
    setFavorites(newFavs);
    localStorage.setItem("ot_favorites", JSON.stringify(Array.from(newFavs)));
  };

  // --- MODAL LOGIC ---
  const openCustomizeModal = (item: any) => {
    setCustomizingItem(item);
    setSelectedSize(item.sizes && item.sizes.length > 0 ? item.sizes[0] : null);
    setSelectedAddOns([]);
    setCustomizeModalOpen(true);
  };

  const toggleAddOn = (addon: any) => {
    if (selectedAddOns.some(a => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const getCurrentItemPrice = () => {
    if (!customizingItem) return 0;
    const base = selectedSize ? selectedSize.price : (parseInt(customizingItem.price.replace(/[^0-9]/g, '')) || 0);
    const extras = selectedAddOns.reduce((acc, curr) => acc + curr.price, 0);
    return base + extras;
  };

  const confirmCustomization = () => {
    if (!customizingItem) return;
    const finalPrice = getCurrentItemPrice();

    const newItem: CartItem = {
      cartId: `${customizingItem.id}-${Date.now()}`,
      id: customizingItem.id,
      name: customizingItem.name,
      category: customizingItem.category || "General",
      price: finalPrice,
      qty: 1,
      selectedSize: selectedSize,
      selectedAddOns: selectedAddOns
    };

    addToCartArray(newItem);
    setCustomizeModalOpen(false);
    setCustomizingItem(null);
  };

  // --- CART LOGIC ---
  const addToCartArray = (newItem: CartItem) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === newItem.id && 
        JSON.stringify(item.selectedSize) === JSON.stringify(newItem.selectedSize) &&
        JSON.stringify(item.selectedAddOns) === JSON.stringify(newItem.selectedAddOns)
      );
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].qty += 1;
        return newCart;
      }
      return [...prev, newItem];
    });
  };

  const addSimpleItem = (item: any) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
    const newItem: CartItem = {
      cartId: `${item.id}-${Date.now()}`,
      id: item.id,
      name: item.name,
      category: item.category || "General",
      price: price,
      qty: 1
    };
    addToCartArray(newItem);
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const decreaseQty = (cartId: string) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) return { ...item, qty: item.qty - 1 };
        return item;
      }).filter(item => item.qty > 0);
    });
  };
  
  const increaseQty = (cartId: string) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, qty: item.qty + 1 } : item));
  };

  const getCartTotal = () => {
    return {
      count: cart.reduce((acc, item) => acc + item.qty, 0),
      total: cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    };
  };

  // --- FINAL ORDER PROCESSING ---
  const processOrder = async () => {
    if (!user) return alert("Please login to order!");
    
    // Validation for Delivery
    if (deliveryMethod === "delivery" && !deskNumber.trim()) {
      alert("Please enter your desk number for delivery.");
      return;
    }

    setIsOrdering(true);
    try {
      const { dailyNum, refId } = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, "counters", "daily_orders");
        const counterDoc = await transaction.get(counterRef);
        const todayStr = new Date().toISOString().split('T')[0];
        let currentCount = 0;
        if (counterDoc.exists() && counterDoc.data().date === todayStr) {
           currentCount = counterDoc.data().count;
        }
        const newCount = currentCount + 1;
        transaction.set(counterRef, { count: newCount, date: todayStr }, { merge: true });
        return { dailyNum: newCount, refId: `ORD-${Math.floor(1000 + Math.random() * 9000)}` };
      });

      const dbItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        category: item.category,
        details: item.selectedSize ? `${item.selectedSize.name} ${item.selectedAddOns?.map(a=>`+${a.name}`).join(' ')}` : ""
      }));

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName || "Member",
        items: dbItems,
        totalAmount: getCartTotal().total,
        status: "Pending",
        orderNumber: dailyNum,
        referenceId: refId,
        
        // NEW FIELDS FOR DELIVERY
        deliveryMethod: deliveryMethod, // 'pickup' or 'delivery'
        deskLocation: deliveryMethod === "delivery" ? deskNumber : "Counter",
        
        orderDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });

      setOrderPlaced(true);
      setCart([]);
      setCheckoutModalOpen(false); // Close modal
      setDeskNumber(""); // Reset desk
      setTimeout(() => setOrderPlaced(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Order failed.");
    } finally {
      setIsOrdering(false);
    }
  };

  const { count: cartCount, total: cartTotal } = getCartTotal();

  // --- MENU CARD ---
  const MenuCard = ({ item }: { item: any }) => {
    const itemInCart = cart.filter(c => c.id === item.id);
    const totalQty = itemInCart.reduce((acc, curr) => acc + curr.qty, 0);
    const hasOptions = (item.sizes && item.sizes.length > 0) || (item.addOns && item.addOns.length > 0);
    const isFav = favorites.has(item.id);

    return (
      <Card className={`relative border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-stone-900 overflow-visible group pt-2 ${totalQty > 0 ? 'ring-2 ring-teal-500 border-teal-200' : ''}`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-t-xl" />
        {item.isRecommended && (
          <div className="absolute -top-3 right-4 z-10">
             <Badge className="bg-amber-100 text-amber-800 border-2 border-white ring-1 ring-amber-200 px-3 py-1 flex items-center gap-1.5 shadow-sm rounded-full">
               <Sparkles size={10} className="text-amber-500 fill-amber-500" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Chef's Choice</span>
             </Badge>
          </div>
        )}
        <div className="p-5 pt-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-stone-900 dark:text-stone-50 text-lg leading-tight pr-6">{item.name}</h3>
               <button onClick={() => toggleFavorite(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                 <Heart size={18} className={cn(isFav ? "fill-red-500 text-red-500" : "")} />
               </button>
            </div>
            <p className="text-sm text-stone-500 line-clamp-2 mb-4 leading-relaxed flex-1">{item.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags?.map((tag: string, index: number) => (
                <span key={index} className="text-[10px] uppercase font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded dark:bg-stone-800 border border-stone-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="font-bold text-lg text-teal-700 dark:text-teal-400">{item.price}</span>
                {totalQty === 0 ? (
                   <Button onClick={() => hasOptions ? openCustomizeModal(item) : addSimpleItem(item)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm h-9 px-5 text-xs rounded-md transition-transform active:scale-95 flex gap-2">
                      Add {hasOptions && <Settings size={12} className="opacity-70" />}
                   </Button>
                ) : (
                   <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-md h-9 px-1">
                      {hasOptions ? (
                        <Button onClick={() => openCustomizeModal(item)} variant="ghost" className="text-teal-700 font-bold text-xs hover:bg-teal-100 h-8">Add Another (+{totalQty})</Button>
                      ) : (
                        <>
                           <Button size="icon" variant="ghost" onClick={() => decreaseQty(itemInCart[0].cartId)} className="text-teal-700 hover:bg-teal-200 h-8 w-8"><Minus size={16}/></Button>
                           <span className="font-bold text-teal-900 text-sm px-3">{totalQty}</span>
                           <Button size="icon" variant="ghost" onClick={() => increaseQty(itemInCart[0].cartId)} className="text-teal-700 hover:bg-teal-200 h-8 w-8"><Plus size={16}/></Button>
                        </>
                      )}
                   </div>
                )}
            </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans pb-32">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all duration-200">
        <div className="relative flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto h-[60px]">
           <div className="flex items-center shrink-0 z-20">
             {user ? (
               <Link href="/dashboard"><Button variant="ghost" size="sm" className="gap-2 text-stone-600 hover:text-stone-900 pl-0"><LayoutDashboard size={20} /> <span className="hidden sm:inline">Dashboard</span></Button></Link>
             ) : (
               <Link href="/"><Button variant="ghost" size="sm" className="gap-2 text-stone-600 hover:text-stone-900 pl-0"><ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span></Button></Link>
             )}
           </div>
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
             <h1 className="text-lg font-bold text-stone-900">OverTime <span className="text-teal-600">Menu</span></h1>
           </div>
           <div className="flex items-center gap-3 shrink-0 z-20">
               <div className="relative hidden md:block w-[220px]">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                   <Input placeholder="Search..." className="pl-9 h-9 bg-stone-100 border-none rounded-full text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                   {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"><X className="w-4 h-4" /></button>}
               </div>
               {cartCount > 0 && <span className="md:hidden text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">{cartCount}</span>}
           </div>
        </div>
        <div className="px-4 md:px-6 border-t border-stone-100 bg-white">
           <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto no-scrollbar py-2">
             {allCategories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-all whitespace-nowrap border", activeCategory === cat ? "bg-stone-900 text-white border-stone-900 shadow-md transform scale-105" : "bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-800")}>
                  {categoryIcons[cat]} {cat}
                </button>
             ))}
           </div>
        </div>
      </header>

      {/* MENU GRID */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-2 space-y-8">
        {loading ? <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-stone-300 w-8 h-8" /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {menuItems.filter(item => {
                 const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase());
                 if (activeCategory === "All") return matchesSearch;
                 if (activeCategory === "Favorites") return favorites.has(item.id) && matchesSearch;
                 return item.category === activeCategory && matchesSearch;
              }).map((item) => <MenuCard key={item.id} item={item} />)
            }
            {!loading && menuItems.filter(i => activeCategory === "Favorites" ? favorites.has(i.id) : (activeCategory === "All" || i.category === activeCategory)).length === 0 && (
               <div className="col-span-full py-20 text-center flex flex-col items-center"><div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-300">{activeCategory === "Favorites" ? <Heart size={32} /> : <Search size={32} />}</div><p className="text-stone-500 font-medium">{activeCategory === "Favorites" ? "No favorites yet." : "No items found."}</p></div>
            )}
          </div>
        )}
      </main>

      {/* CUSTOMIZATION MODAL */}
      {customizeModalOpen && customizingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
               <h3 className="font-bold text-lg text-stone-900">Customize {customizingItem.name}</h3>
               <button onClick={() => setCustomizeModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
             </div>
             <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
               {customizingItem.sizes?.length > 0 && (
                 <div className="space-y-3"><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Size</p><div className="grid grid-cols-2 gap-3">{customizingItem.sizes.map((size: any) => (<button key={size.name} onClick={() => setSelectedSize(size)} className={`p-3 rounded-lg border text-left transition-all ${selectedSize?.name === size.name ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-stone-200 hover:border-stone-300"}`}><div className="font-bold text-sm text-stone-900">{size.name}</div><div className="text-xs text-stone-500">LKR {size.price}</div></button>))}</div></div>
               )}
               {customizingItem.addOns?.length > 0 && (
                 <div className="space-y-3"><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Add-ons</p><div className="space-y-2">{customizingItem.addOns.map((addon: any) => { const isSelected = selectedAddOns.some(a => a.name === addon.name); return (<button key={addon.name} onClick={() => toggleAddOn(addon)} className={`w-full flex justify-between items-center p-3 rounded-lg border transition-all ${isSelected ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:bg-stone-50"}`}><span className={`text-sm ${isSelected ? "font-bold text-amber-900" : "text-stone-700"}`}>{addon.name}</span><span className="text-xs text-stone-500">+ LKR {addon.price}</span></button>); })}</div></div>
               )}
             </div>
             <div className="p-5 border-t border-stone-100 bg-stone-50 flex items-center gap-4">
               <div className="flex-1 text-right"><p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Total</p><p className="text-xl font-bold text-teal-700">LKR {getCurrentItemPrice()}</p></div>
               <Button onClick={confirmCustomization} className="flex-1 bg-stone-900 hover:bg-stone-800 text-white h-12 text-base font-bold shadow-lg">Add to Order</Button>
             </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL (NEW: Order to Desk) */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
             <div className="p-5 border-b border-stone-100 bg-stone-50">
               <h3 className="font-bold text-lg text-stone-900">Confirm Order</h3>
               <p className="text-sm text-stone-500">{cartCount} items • LKR {cartTotal}</p>
             </div>
             
             <div className="p-5 space-y-5">
                {/* Toggle */}
                <div className="bg-stone-100 p-1 rounded-lg flex">
                   <button onClick={() => setDeliveryMethod("pickup")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === "pickup" ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"}`}>
                     Pickup
                   </button>
                   <button onClick={() => setDeliveryMethod("delivery")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${deliveryMethod === "delivery" ? "bg-white shadow-sm text-teal-700" : "text-stone-500 hover:text-stone-900"}`}>
                     Deliver to Desk
                   </button>
                </div>

                {/* Desk Input */}
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <Label className="text-xs font-bold text-stone-500 uppercase">Desk / Table Number</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                      <Input 
                        placeholder="e.g. Desk 4, Meeting Room B" 
                        value={deskNumber}
                        onChange={(e) => setDeskNumber(e.target.value)}
                        className="pl-9 bg-stone-50 border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {deliveryMethod === "pickup" && (
                  <div className="p-3 bg-stone-50 rounded-lg flex items-start gap-3 text-sm text-stone-600">
                    <Store className="h-5 w-5 text-stone-400 shrink-0" />
                    <p>We'll notify you when your order is ready at the counter.</p>
                  </div>
                )}
             </div>

             <div className="p-5 border-t border-stone-100 flex gap-3">
               <Button variant="ghost" onClick={() => setCheckoutModalOpen(false)} className="flex-1 text-stone-500">Cancel</Button>
               <Button onClick={processOrder} disabled={isOrdering} className="flex-[2] bg-stone-900 hover:bg-stone-800 text-white font-bold h-11">
                 {isOrdering ? <Loader2 className="w-4 h-4 animate-spin"/> : `Pay LKR ${cartTotal}`}
               </Button>
             </div>
          </div>
        </div>
      )}

      {/* FLOATING CHECKOUT BAR */}
      {(cartCount > 0 || orderPlaced) && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50 animate-in slide-in-from-bottom-4">
           {orderPlaced ? (
             <div className="bg-teal-600 text-white p-3 rounded-xl shadow-xl flex items-center justify-center gap-2 w-full max-w-md">
                <CheckCircle2 className="w-5 h-5" /><span className="font-bold text-sm">Order Sent! {deliveryMethod === "delivery" ? `to ${deskNumber}` : "Pickup"}</span>
             </div>
           ) : (
             <div className="bg-stone-900 text-white p-3 pl-5 rounded-xl shadow-2xl flex items-center justify-between w-full max-w-md ring-1 ring-white/10 backdrop-blur-md">
                <div className="flex flex-col">
                   <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Total</span>
                   <div className="flex items-end gap-2">
                      <span className="text-xl font-bold leading-none">LKR {cartTotal}</span>
                      <span className="text-stone-500 text-xs mb-0.5">({cartCount} items)</span>
                   </div>
                </div>
                <Button onClick={() => setCheckoutModalOpen(true)} className="bg-white text-stone-900 hover:bg-stone-200 font-bold px-6 h-10 text-sm rounded-lg">
                  Checkout
                </Button>
             </div>
           )}
        </div>
      )}
    </div>
  );
}