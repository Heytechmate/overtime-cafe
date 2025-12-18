"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Use setDoc for merge capability
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Phone } from "lucide-react";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "", // NEW: Capture Phone
    birthDate: ""
  });

  // 1. Check Login & Profile Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth");
        return;
      }
      setUser(currentUser);
      
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Pre-fill existing data (e.g., name from Google)
        if (data.name) {
            const [first, ...last] = data.name.split(" ");
            setFormData(prev => ({...prev, firstName: first, lastName: last.join(" ")}));
        }
        
        // If everything is already there, skip to dashboard
        if (data.isProfileComplete) {
          router.push("/dashboard"); 
        }
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) return;

    try {
      // 2. Save Profile (Merge ensures we don't overwrite existing fields like email/role)
      await setDoc(doc(db, "users", user.uid), {
        name: `${formData.firstName} ${formData.lastName}`, // Combine for display
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        isProfileComplete: true,
        updatedAt: new Date()
      }, { merge: true });

      // 3. Go to Dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 font-sans p-4">
      <Card className="w-full max-w-[450px] shadow-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            One Last Step
          </CardTitle>
          <CardDescription>
            Complete your profile to unlock member perks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required 
                />
              </div>
            </div>

            {/* NEW: Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                <Input 
                  id="phone" 
                  placeholder="077 123 4567" 
                  className="pl-9"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                <Input 
                  id="birthDate" 
                  type="date" 
                  className="pl-9"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  required 
                />
              </div>
              <p className="text-xs text-stone-500">Free coffee on your birthday! 🎂</p>
            </div>

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Profile"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}