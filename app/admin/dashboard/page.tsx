"use client";

import { useState, useEffect } from "react";
import { 
  addDoc, collection, deleteDoc, doc, updateDoc, onSnapshot, 
  query, where, getDocs, setDoc, getDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Plus, Search, Coffee, Gift, Trophy, Loader2, Pencil, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // Loyalty State
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [foundMember, setFoundMember] = useState<any>(null);
  const [coffeeGoal, setCoffeeGoal] = useState(10); // Default

  // Menu State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "Beverage", description: "", 
    tags: "", isRecommended: false, rating: "4.5", reviewCount: "10"
  });

  // 1. Fetch Data
  useEffect(() => {
    // Listen to Menu
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Coffee Goal Setting
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "loyalty");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCoffeeGoal(snap.data().coffeeGoal || 10);
      } else {
        // Create default if not exists
        await setDoc(doc(db, "settings", "loyalty"), { coffeeGoal: 10 });
      }
    };
    fetchSettings();

    return () => unsubMenu();
  }, []);

  // --- LOYALTY FUNCTIONS ---

  const handleSearchMember = async () => {
    setLoading(true);
    setFoundMember(null);
    try {
      // Search by Custom ID (e.g., OT0001)
      const q = query(collection(db, "users"), where("memberId", "==", memberIdSearch.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setFoundMember({ id: userDoc.id, ...userDoc.data() });
      } else {
        alert("Member not found!");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoffee = async () => {
    if (!foundMember) return;
    
    const currentCoffees = foundMember.coffeeCount || 0;
    const currentFree = foundMember.freeCoffees || 0;
    let newCoffees = currentCoffees + 1;
    let newFree = currentFree;

    // Check if Goal Reached
    if (newCoffees >= coffeeGoal) {
      newCoffees = 0; // Reset
      newFree += 1;   // Earn Reward
      alert(`🎉 GOAL REACHED! ${foundMember.firstName} gets a FREE coffee!`);
    }

    try {
      await updateDoc(doc(db, "users", foundMember.id), {
        coffeeCount: newCoffees,
        freeCoffees: newFree
      });
      // Update local state to reflect change immediately
      setFoundMember(prev => ({ ...prev, coffeeCount: newCoffees, freeCoffees: newFree }));
      setSuccess("Coffee added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      alert("Error updating member");
    }
  };

  const handleRedeemFree = async () => {
    if (!foundMember || (foundMember.freeCoffees || 0) <= 0) return;
    
    if(!confirm("Redeem 1 Free Coffee?")) return;

    try {
      await updateDoc(doc(db, "users", foundMember.id), {
        freeCoffees: (foundMember.freeCoffees || 0) - 1
      });
      setFoundMember(prev => ({ ...prev, freeCoffees: prev.freeCoffees - 1 }));
      setSuccess("Redeemed successfully!");
    } catch (error) {
      alert("Error redeeming");
    }
  }

  const handleUpdateGoal = async () => {
    const newGoal = prompt("Enter new coffee goal (e.g. 10):", coffeeGoal.toString());
    if (newGoal && !isNaN(parseInt(newGoal))) {
      await setDoc(doc(db, "settings", "loyalty"), { coffeeGoal: parseInt(newGoal) });
      setCoffeeGoal(parseInt(newGoal));
    }
  }

  // --- MENU FUNCTIONS (Existing) ---
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name, price: item.price.replace("LKR ", ""), category: item.category,
      description: item.description, tags: item.tags.join(", "),
      isRecommended: item.isRecommended || false, rating: item.rating?.toString() || "4.5", reviewCount: item.reviewCount?.toString() || "10"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this item?")) await deleteDoc(doc(db, "menu", id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const itemData = {
        name: formData.name, price: "LKR " + formData.price, category: formData.category,
        description: formData.description, tags: formData.tags.split(",").map(tag => tag.trim()).filter(t => t),
        isRecommended: formData.isRecommended, rating: parseFloat(formData.rating), reviewCount: parseInt(formData.reviewCount)
      };

      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), itemData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "menu"), itemData);
      }
      setFormData({ name: "", price: "", category: "Beverage", description: "", tags: "", isRecommended: false, rating: "4.5", reviewCount: "10" });
      setSuccess("Menu updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Dashboard</h1>
          <p className="text-stone-500 mt-1">Manage menu & loyalty.</p>
        </div>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty & POS</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: MENU --- */}
        <TabsContent value="menu" className="space-y-8">
           {/* (Paste your existing Menu Form & List code here from previous step if needed, 
                but for brevity I'm skipping re-pasting the full menu UI unless you need it. 
                The logic is already in the 'Menu Functions' section above.) 
            */}
           <div className="p-4 border rounded bg-white text-center text-stone-500">
              (Menu Management UI goes here - same as before)
           </div>
        </TabsContent>

        {/* --- TAB 2: LOYALTY --- */}
        <TabsContent value="loyalty" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Search Card */}
            <Card className="md:col-span-2 bg-white dark:bg-stone-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <Coffee className="text-teal-600"/> Coffee Punch
                </CardTitle>
                <CardDescription>Enter Member ID (e.g. OT0001) to add a stamp.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input 
                    placeholder="Search ID..." 
                    value={memberIdSearch}
                    onChange={(e) => setMemberIdSearch(e.target.value)}
                  />
                  <Button onClick={handleSearchMember} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin"/> : <Search className="w-4 h-4"/>}
                  </Button>
                </div>

                {foundMember && (
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-100 flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xl font-bold">
                      {foundMember.firstName?.[0]}{foundMember.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{foundMember.firstName} {foundMember.lastName}</h3>
                      <p className="text-stone-500 text-sm">{foundMember.memberId}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                       <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-stone-500 uppercase">Progress</p>
                          <p className="text-2xl font-bold text-teal-600">{foundMember.coffeeCount || 0} <span className="text-sm text-stone-400">/ {coffeeGoal}</span></p>
                       </div>
                       <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-stone-500 uppercase">Free Coffees</p>
                          <p className="text-2xl font-bold text-amber-600">{foundMember.freeCoffees || 0}</p>
                       </div>
                    </div>

                    <div className="flex gap-3 w-full">
                      <Button className="flex-1 bg-stone-900" onClick={handleAddCoffee}>
                        <Plus className="w-4 h-4 mr-2"/> Add Stamp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={handleRedeemFree}
                        disabled={!foundMember.freeCoffees}
                      >
                        <Gift className="w-4 h-4 mr-2"/> Redeem Free
                      </Button>
                    </div>
                    {success && <p className="text-green-600 text-sm font-medium animate-pulse">{success}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="bg-teal-50 dark:bg-teal-900/10 border-teal-100">
               <CardHeader>
                 <CardTitle className="text-teal-900">Loyalty Settings</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-800">Target Cups</span>
                    <span className="text-2xl font-bold text-teal-900">{coffeeGoal}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleUpdateGoal}>
                    Change Goal
                  </Button>
                  <p className="text-xs text-teal-700 mt-2">
                    *Changing this affects all members immediately.
                  </p>
               </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}