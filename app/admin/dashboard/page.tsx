"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, AlertCircle, Loader2, Coffee } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Beverage",
    description: "",
    tags: "",
    isRecommended: false,
    rating: "4.5",
    reviewCount: "10"
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const newItem = {
        name: formData.name,
        price: "LKR " + formData.price, // Auto-add currency
        category: formData.category,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()), 
        isRecommended: formData.isRecommended,
        rating: parseFloat(formData.rating),
        reviewCount: parseInt(formData.reviewCount)
      };

      await addDoc(collection(db, "menu"), newItem);
      
      setSuccess(true);
      // Reset form
      setFormData({
        name: "", price: "", category: "Beverage", description: "", 
        tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Dashboard</h1>
          <p className="text-stone-500 mt-1 dark:text-stone-400">Manage your café content and orders.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex border-stone-300">
          <AlertCircle className="w-4 h-4 mr-2" /> Help & Support
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add Item Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md bg-white dark:bg-stone-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600"/> Add New Menu Item
              </CardTitle>
              <CardDescription>Fill in the details below to update the live menu.</CardDescription>
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

                <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Live Menu"}
                </Button>

                {success && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4" /> Item added successfully! Check the Menu page.
                  </div>
                )}

              </form>
            </CardContent>
          </Card>
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
                  <span className="text-sm text-teal-700 dark:text-teal-300">Open Orders</span>
                  <span className="font-bold text-teal-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Active Bookings</span>
                  <span className="font-bold text-teal-900 dark:text-white">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle className="text-sm text-stone-500">Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-2">
                <Button variant="ghost" className="justify-start">
                    <Coffee className="w-4 h-4 mr-2"/> Edit Menu Items
                </Button>
             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}