"use client";

import { useState, useEffect } from "react";
// ✅ IMPORT: doc, setDoc, getDoc, onSnapshot
import { addDoc, collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, AlertCircle, Loader2, Coffee, Store, Lock, Unlock } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // ✅ NEW: Store Status State
  const [statusLoading, setStatusLoading] = useState(false);
  const [storeStatus, setStoreStatus] = useState({
    isOpen: true,
    message: "Open Now."
  });

  const [formData, setFormData] = useState({
    name: "", price: "", category: "Beverage", description: "",
    tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
  });

  // ✅ NEW: Listen to Store Status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "storeStatus"), (doc) => {
      if (doc.exists()) {
        setStoreStatus(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  // ✅ NEW: Handle Status Update
  const handleUpdateStatus = async (newIsOpen: boolean) => {
    setStatusLoading(true);
    try {
      // If closing, suggest a default message, else default open message
      let newMessage = storeStatus.message;
      if (!newIsOpen && newMessage.includes("Open")) newMessage = "Closed for Prayers. Back at 1:30 PM.";
      if (newIsOpen && newMessage.includes("Closed")) newMessage = "Open Now.";

      const newStatus = { isOpen: newIsOpen, message: newMessage };
      
      await setDoc(doc(db, "settings", "storeStatus"), newStatus);
      // State updates automatically via listener
    } catch (error) {
      console.error("Status update failed", error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleMessageChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusLoading(true);
    try {
      await setDoc(doc(db, "settings", "storeStatus"), storeStatus);
      alert("Status message updated!");
    } catch (error) {
       console.error(error);
    } finally {
      setStatusLoading(false);
    }
  }

  // --- EXISTING MENU LOGIC ---
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage your café content and status.</p>
        </div>
        <Button variant="outline" className="hidden sm:flex border-stone-300">
          <AlertCircle className="w-4 h-4 mr-2" /> Help & Support
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add Item Form (Unchanged) */}
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
                    <select id="category" name="category" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-stone-900" value={formData.category} onChange={handleChange}>
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
                <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Live Menu"}
                </Button>
                {success && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md flex items-center justify-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="w-4 h-4" /> Item added successfully!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Store Status & Stats */}
        <div className="space-y-6">
          
          {/* ✅ NEW: Store Control Card */}
          <Card className={`border-2 ${storeStatus.isOpen ? 'border-teal-100 bg-teal-50/50' : 'border-red-100 bg-red-50/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${storeStatus.isOpen ? 'text-teal-900' : 'text-red-900'}`}>
                <Store className="w-5 h-5"/> {storeStatus.isOpen ? "We are OPEN" : "We are CLOSED"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className={`flex-1 ${storeStatus.isOpen ? 'bg-teal-600 hover:bg-teal-700' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
                  onClick={() => handleUpdateStatus(true)}
                  disabled={statusLoading}
                >
                  {statusLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Unlock className="w-4 h-4 mr-2"/>} Open
                </Button>
                <Button 
                  size="sm" 
                  className={`flex-1 ${!storeStatus.isOpen ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
                  onClick={() => handleUpdateStatus(false)}
                  disabled={statusLoading}
                >
                  {statusLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Lock className="w-4 h-4 mr-2"/>} Close
                </Button>
              </div>

              <form onSubmit={handleMessageChange} className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-stone-500">Live Homepage Message</Label>
                <Input 
                  value={storeStatus.message}
                  onChange={(e) => setStoreStatus(prev => ({...prev, message: e.target.value}))}
                  className="bg-white"
                />
                <Button size="sm" variant="ghost" className="w-full text-xs h-8">Update Text Only</Button>
              </form>

            </CardContent>
          </Card>

          {/* Existing Stats */}
          <Card className="bg-white border-stone-200">
            <CardHeader>
              <CardTitle className="text-stone-900">Live Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Open Orders</span>
                  <span className="font-bold text-stone-900">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Active Bookings</span>
                  <span className="font-bold text-stone-900">5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}