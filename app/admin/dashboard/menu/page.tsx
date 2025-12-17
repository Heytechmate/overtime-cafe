"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Trash2, Coffee, X, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "Beverage", description: "",
    tags: "", isRecommended: false, rating: 4.5, reviewCount: 10
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await addDoc(collection(db, "menu"), {
        ...formData,
        price: "LKR " + formData.price,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        rating: Number(formData.rating),
        reviewCount: Number(formData.reviewCount)
      });
      setFormData({ name: "", price: "", category: "Beverage", description: "", tags: "", isRecommended: false, rating: 4.5, reviewCount: 10 });
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
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-20 px-4 sm:px-0">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Menu</h1>
          <p className="text-xs text-stone-500">Manage your items.</p>
        </div>
        <Button 
          size="sm"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`${isFormOpen ? "bg-stone-200 text-stone-800" : "bg-stone-900 text-white"} transition-colors h-8 text-xs px-4`}
        >
          {isFormOpen ? <><X className="mr-2 h-3 w-3"/> Cancel</> : <><Plus className="mr-2 h-3 w-3"/> Add Item</>}
        </Button>
      </div>

      {/* --- COMPACT FORM --- */}
      {isFormOpen && (
        <Card className="border-t-4 border-t-teal-600 shadow-sm animate-in slide-in-from-top-2">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} className="h-8 text-xs" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price (LKR)</Label>
                  <Input name="price" type="number" placeholder="1200" value={formData.price} onChange={handleChange} className="h-8 text-xs" required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <select name="category" value={formData.category} onChange={handleChange} className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none dark:bg-stone-900">
                    {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tags</Label>
                  <Input name="tags" placeholder="Vegan, Spicy" value={formData.tags} onChange={handleChange} className="h-8 text-xs" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input name="description" placeholder="Short description..." value={formData.description} onChange={handleChange} className="h-8 text-xs" required />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2 bg-stone-50 px-3 py-1.5 rounded-md border border-stone-100 h-8">
                    <input type="checkbox" id="isRecommended" name="isRecommended" className="h-3 w-3 rounded text-teal-600" checked={formData.isRecommended} onChange={handleChange} />
                    <Label htmlFor="isRecommended" className="cursor-pointer text-xs font-normal">Chef's Choice</Label>
                  </div>
                  <Button type="submit" size="sm" className="bg-stone-900 text-white h-8 text-xs" disabled={formLoading}>
                    {formLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* --- FILTERS & SEARCH --- */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center py-1">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide">
          <Filter className="w-3 h-3 text-stone-400 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat 
                  ? "bg-stone-900 text-white" 
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-48">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-400" />
           <Input 
             placeholder="Search..." 
             className="pl-8 h-8 text-xs bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* --- COMPACT GRID (3 Columns) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
           <p className="col-span-full text-center text-stone-400 text-xs py-10">Loading...</p>
        ) : filteredItems.length === 0 ? (
           <div className="col-span-full text-center py-8 bg-white rounded-lg border border-dashed border-stone-200">
             <p className="text-stone-400 text-xs">No items found.</p>
           </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-lg flex items-start justify-between shadow-sm hover:border-teal-500/30 transition-all">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Coffee size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">{item.name}</h4>
                    {item.isRecommended && <div className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Chef's Choice" />}
                  </div>
                  <p className="text-xs text-stone-500 truncate">{item.category} • {item.price}</p>
                </div>
              </div>
              <button 
                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}