"use client";

import { useState, useEffect } from "react";
import { 
  addDoc, collection, deleteDoc, doc, updateDoc, onSnapshot 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Loader2, Pencil, Trash2, Coffee, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // Menu State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "Beverage", description: "", 
    tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
  });

  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubMenu();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name, 
      price: item.price.toString().replace("LKR ", ""), 
      category: item.category,
      description: item.description, 
      tags: item.tags ? item.tags.join(", ") : "",
      isRecommended: item.isRecommended || false, 
      rating: item.rating?.toString() || "4.5", 
      reviewCount: item.reviewCount?.toString() || "10"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this item?")) await deleteDoc(doc(db, "menu", id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
        name: "", price: "", category: "Beverage", description: "", 
        tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemData = {
        name: formData.name, 
        price: "LKR " + formData.price, 
        category: formData.category,
        description: formData.description, 
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(t => t),
        isRecommended: formData.isRecommended, 
        rating: parseFloat(formData.rating), 
        reviewCount: parseInt(formData.reviewCount)
      };

      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), itemData);
        setEditingId(null);
        setSuccess("Item updated!");
      } else {
        await addDoc(collection(db, "menu"), itemData);
        setSuccess("Item added!");
      }
      setFormData({ name: "", price: "", category: "Beverage", description: "", tags: "", isRecommended: false, rating: "4.5", reviewCount: "10" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage your café content and menu.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex border-stone-300">
          <AlertCircle className="w-4 h-4 mr-2" /> Help & Support
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add/Edit Item Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={`border-none shadow-md ${editingId ? "bg-amber-50/50 border-2 border-amber-200" : "bg-white"} dark:bg-stone-950`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingId ? <Pencil className="w-5 h-5 text-amber-600"/> : <Plus className="w-5 h-5 text-teal-600"/>}
                {editingId ? "Edit Menu Item" : "Add New Menu Item"}
              </CardTitle>
              <CardDescription>
                {editingId ? "Updating existing item details." : "Fill in the details below to update the live menu."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Truffle Fries" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (LKR)</Label>
                    <Input id="price" name="price" type="number" placeholder="1200" value={formData.price} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" 
                      name="category" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-stone-900"
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
                  <Input 
                    id="description" 
                    name="description" 
                    placeholder="Short, appetizing description..." 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-100 dark:border-stone-800">
                   <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="isRecommended" 
                        name="isRecommended" 
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        checked={formData.isRecommended}
                        onChange={handleChange}
                      />
                      <Label htmlFor="isRecommended" className="cursor-pointer font-normal text-stone-600 dark:text-stone-300">
                        Mark as "Chef's Choice"
                      </Label>
                   </div>
                </div>

                <div className="flex gap-3">
                    {editingId && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" className="flex-1 bg-stone-900 hover:bg-stone-800 text-white" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingId ? "Update Item" : "Add to Live Menu")}
                    </Button>
                </div>

                {success && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4" /> {success}
                  </div>
                )}

              </form>
            </CardContent>
          </Card>

          {/* Manage Existing Items */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Live Menu Items ({menuItems.length})</h3>
            <div className="grid gap-3">
                {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-stone-100">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                                <Coffee className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-stone-800">{item.name}</h4>
                                <div className="flex gap-2 text-xs text-stone-500">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span>{item.price}</span>
                                    {item.isRecommended && <span className="text-amber-600 font-bold">• Recommended</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                <Pencil className="w-4 h-4 text-stone-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-6">
          <Card className="bg-teal-50 border-teal-100 dark:bg-teal-900/20 dark:border-teal-900">
            <CardHeader>
              <CardTitle className="text-teal-900 dark:text-teal-100">Live Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Total Menu Items</span>
                  <span className="font-bold text-teal-900 dark:text-white">{menuItems.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}