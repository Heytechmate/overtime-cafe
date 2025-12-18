"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Trash2, Coffee, X, Filter, Search, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "", basePrice: "", category: "Beverage", description: "",
    tags: "", isRecommended: false
  });

  // Variants State
  const [sizes, setSizes] = useState<{ name: string, price: string }[]>([]);
  const [addOns, setAddOns] = useState<{ name: string, price: string }[]>([]);
  const [tempSize, setTempSize] = useState({ name: "", price: "" });
  const [tempAddOn, setTempAddOn] = useState({ name: "", price: "" });

  const categories = ["All", "Beverage", "Snack", "Productivity", "Creative"];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addSize = () => {
    if (tempSize.name && tempSize.price) {
      setSizes([...sizes, tempSize]);
      setTempSize({ name: "", price: "" });
    }
  };

  const addAddOn = () => {
    if (tempAddOn.name && tempAddOn.price) {
      setAddOns([...addOns, tempAddOn]);
      setTempAddOn({ name: "", price: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await addDoc(collection(db, "menu"), {
        ...formData,
        price: "LKR " + formData.basePrice, // Fallback display price
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        sizes: sizes.map(s => ({ name: s.name, price: Number(s.price) })),
        addOns: addOns.map(a => ({ name: a.name, price: Number(a.price) })),
        rating: 4.5,
        reviewCount: 10
      });
      // Reset Form
      setFormData({ name: "", basePrice: "", category: "Beverage", description: "", tags: "", isRecommended: false });
      setSizes([]);
      setAddOns([]);
      setIsFormOpen(false);
    } catch (error) {
      alert("Failed to add item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this item?")) await deleteDoc(doc(db, "menu", id));
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20 px-4 sm:px-0">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Menu Manager</h1>
          <p className="text-xs text-stone-500">Add sizes & shots to your coffee.</p>
        </div>
        <Button 
          size="sm"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`${isFormOpen ? "bg-stone-200 text-stone-800" : "bg-stone-900 text-white"} h-9 text-xs px-4`}
        >
          {isFormOpen ? <><X className="mr-2 h-3 w-3"/> Cancel</> : <><Plus className="mr-2 h-3 w-3"/> New Item</>}
        </Button>
      </div>

      {/* FORM */}
      {isFormOpen && (
        <Card className="border-t-4 border-t-teal-600 shadow-lg animate-in slide-in-from-top-2">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input name="name" placeholder="e.g. Latte" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label>Base Price (LKR)</Label>
                  <Input name="basePrice" type="number" placeholder="500" value={formData.basePrice} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <select name="category" value={formData.category} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm">
                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Tags</Label>
                  <Input name="tags" placeholder="Hot, Dairy" value={formData.tags} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-1">
                 <Label>Description</Label>
                 <Input name="description" placeholder="A rich espresso with steamed milk..." value={formData.description} onChange={handleChange} required />
              </div>

              {/* Advanced Options (Sizes & Addons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-stone-50 rounded-lg border border-stone-100">
                
                {/* SIZES */}
                <div className="space-y-3">
                   <Label className="text-teal-700 font-bold flex items-center gap-2"><Coffee size={14}/> Cup Sizes</Label>
                   <div className="flex gap-2">
                      <Input placeholder="Size (e.g. Large)" value={tempSize.name} onChange={e => setTempSize({...tempSize, name: e.target.value})} className="h-8 text-xs bg-white" />
                      <Input type="number" placeholder="Price" value={tempSize.price} onChange={e => setTempSize({...tempSize, price: e.target.value})} className="h-8 text-xs bg-white w-24" />
                      <Button type="button" onClick={addSize} size="sm" className="h-8 bg-teal-600 text-white"><Plus size={14}/></Button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {sizes.map((s, i) => (
                        <Badge key={i} variant="outline" className="bg-white text-stone-600 pr-1">
                          {s.name} - {s.price} <X size={12} className="ml-2 cursor-pointer hover:text-red-500" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} />
                        </Badge>
                      ))}
                   </div>
                </div>

                {/* ADD-ONS */}
                <div className="space-y-3">
                   <Label className="text-amber-700 font-bold flex items-center gap-2"><Tag size={14}/> Add-ons (Shots/Syrups)</Label>
                   <div className="flex gap-2">
                      <Input placeholder="Name (e.g. Extra Shot)" value={tempAddOn.name} onChange={e => setTempAddOn({...tempAddOn, name: e.target.value})} className="h-8 text-xs bg-white" />
                      <Input type="number" placeholder="Price" value={tempAddOn.price} onChange={e => setTempAddOn({...tempAddOn, price: e.target.value})} className="h-8 text-xs bg-white w-24" />
                      <Button type="button" onClick={addAddOn} size="sm" className="h-8 bg-amber-600 text-white"><Plus size={14}/></Button>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {addOns.map((a, i) => (
                        <Badge key={i} variant="outline" className="bg-white text-stone-600 pr-1">
                          {a.name} - {a.price} <X size={12} className="ml-2 cursor-pointer hover:text-red-500" onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))} />
                        </Badge>
                      ))}
                   </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rec" checked={formData.isRecommended} onChange={(e) => setFormData({...formData, isRecommended: e.target.checked})} className="rounded text-teal-600 focus:ring-teal-600"/>
                  <Label htmlFor="rec" className="text-sm">Promote as Chef's Pick</Label>
                </div>
                <Button type="submit" className="bg-stone-900 text-white px-8" disabled={formLoading}>
                  {formLoading ? <Loader2 className="animate-spin mr-2" /> : null} Save Item
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      )}

      {/* SEARCH */}
      <div className="flex justify-between items-center gap-4 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
         <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeCategory === c ? "bg-stone-900 text-white" : "hover:bg-stone-100 text-stone-600"}`}>
                {c}
              </button>
            ))}
         </div>
         <div className="relative w-48">
            <Search className="absolute left-2 top-2 h-4 w-4 text-stone-400" />
            <Input placeholder="Search items..." className="pl-8 h-8 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
         </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-stone-200 p-4 rounded-lg flex flex-col gap-3 shadow-sm hover:border-teal-500 transition-colors group relative">
             <div className="flex justify-between items-start">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-stone-100 rounded-md flex items-center justify-center text-stone-400"><Coffee size={20}/></div>
                 <div>
                   <h4 className="font-bold text-sm text-stone-900">{item.name}</h4>
                   <p className="text-xs text-stone-500">{item.category}</p>
                 </div>
               </div>
               <span className="font-bold text-sm text-teal-700">{item.price}</span>
             </div>
             
             {/* Sizes & Addons Preview */}
             {(item.sizes?.length > 0 || item.addOns?.length > 0) && (
               <div className="flex flex-wrap gap-1 mt-1">
                 {item.sizes?.length > 0 && <Badge variant="secondary" className="text-[10px] h-5 bg-teal-50 text-teal-700">{item.sizes.length} Sizes</Badge>}
                 {item.addOns?.length > 0 && <Badge variant="secondary" className="text-[10px] h-5 bg-amber-50 text-amber-700">{item.addOns.length} Add-ons</Badge>}
               </div>
             )}

             <button onClick={() => handleDelete(item.id)} className="absolute bottom-4 right-4 text-stone-300 hover:text-red-500 transition-colors">
               <Trash2 size={16} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}