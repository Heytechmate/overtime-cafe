"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Loader2, Trash2, Coffee, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controls the "Drop Down" form
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter State
  const [activeCategory, setActiveCategory] = useState("All");

  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "Beverage", description: "",
    tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
  });

  const categories = ["All", "Beverage", "Snack", "Productivity", "Creative"];

  // 1. Fetch Items
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Handle Form Changes
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // 3. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccess(false);
    try {
      const newItem = {
        name: formData.name,
        price: "LKR " + formData.price,
        category: formData.category,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()), 
        isRecommended: formData.isRecommended,
        rating: parseFloat(formData.rating),
        reviewCount: parseInt(formData.reviewCount)
      };
      await addDoc(collection(db, "menu"), newItem);
      
      setSuccess(true);
      setFormData({
        name: "", price: "", category: "Beverage", description: "", 
        tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
      });
      
      // Optional: Close form after success or keep open
      // setIsFormOpen(false); 
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to add item");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this item permanently?")) {
      await deleteDoc(doc(db, "menu", id));
    }
  };

  // Filter Logic
  const filteredItems = activeCategory === "All" 
    ? items 
    : items.filter(item => item.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">Menu Management</h1>
          <p className="text-stone-500 mt-1">Organize your café offerings.</p>
        </div>
        
        {/* The Toggle Button */}
        <Button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`${isFormOpen ? "bg-stone-200 text-stone-800 hover:bg-stone-300" : "bg-stone-900 text-white hover:bg-stone-800"} transition-colors w-full sm:w-auto`}
        >
          {isFormOpen ? <><X className="mr-2 h-4 w-4"/> Cancel</> : <><Plus className="mr-2 h-4 w-4"/> Add New Item</>}
        </Button>
      </div>

      {/* --- THE DROP DOWN FORM --- */}
      {isFormOpen && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <Card className="border-none shadow-lg bg-white dark:bg-stone-950 border-t-4 border-t-teal-600">
            <CardHeader>
              <CardTitle>Add New Menu Item</CardTitle>
              <CardDescription>Fill in the details to update the live menu immediately.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Truffle Fries" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (LKR)</Label>
                    <Input id="price" name="price" type="number" placeholder="1200" value={formData.price} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" 
                      name="category" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none dark:bg-stone-900" 
                      value={formData.category} 
                      onChange={handleChange}
                    >
                      <option value="Beverage">Beverage</option>
                      <option value="Snack">Snack</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Creative">Creative</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" name="tags" placeholder="e.g. Vegan, Spicy" value={formData.tags} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Short, appetizing description..." value={formData.description} onChange={handleChange} required />
                </div>
                <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
                   <div className="flex items-center space-x-2">
                      <input type="checkbox" id="isRecommended" name="isRecommended" className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600" checked={formData.isRecommended} onChange={handleChange} />
                      <Label htmlFor="isRecommended" className="cursor-pointer font-normal text-stone-600 dark:text-stone-300">Mark as "Chef's Choice"</Label>
                   </div>
                </div>
                <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11" disabled={formLoading}>
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Live Menu"}
                </Button>
                {success && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md text-center text-sm">
                    Item added successfully!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- FILTERS --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat 
                ? "bg-stone-900 text-white" 
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- MENU LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
           <p className="col-span-full text-center text-stone-500 py-10">Loading items...</p>
        ) : filteredItems.length === 0 ? (
           <div className="col-span-full text-center py-10 bg-white rounded-lg border border-dashed border-stone-300">
             <p className="text-stone-500">No items found in this category.</p>
           </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-xl flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 flex-shrink-0">
                  <Coffee size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">{item.name}</h4>
                  <div className="flex flex-wrap gap-2 my-1">
                     <Badge variant="outline" className="text-[10px] text-stone-500 border-stone-200">{item.category}</Badge>
                     {item.isRecommended && <Badge className="text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Chef's Choice</Badge>}
                  </div>
                  <p className="text-sm text-stone-500 font-medium">{item.price}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-red-600 h-8 w-8" onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}