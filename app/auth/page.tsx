"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// ✅ Added 'runTransaction' and 'doc'
import { doc, getDoc, runTransaction } from "firebase/firestore"; 
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ADMIN_UID = "opChtvs1YJghMgry81qKMyM2jlm2";

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>
  );
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUserDestination = async (user: any) => {
    
    if (user.uid === ADMIN_UID) {
      router.push("/admin/dashboard");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // ✅ GENERATE UNIQUE ID (Transaction)
      try {
        await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, "counters", "members");
          const counterSnap = await transaction.get(counterRef);

          let newCount = 1;
          if (counterSnap.exists()) {
            newCount = counterSnap.data().count + 1;
          }

          // Format: OT0001, OT0002...
          const memberId = `OT${newCount.toString().padStart(4, '0')}`;

          // Update Counter
          transaction.set(counterRef, { count: newCount });

          // Create User Profile with Member ID
          transaction.set(userDocRef, {
            email: user.email,
            uid: user.uid,
            memberId: memberId, // ⭐️ Unique ID
            points: 0,
            tier: "Member",
            createdAt: new Date(),
            isProfileComplete: false
          });
        });
        
        router.push("/onboarding"); 
      } catch (error) {
        console.error("Transaction failed: ", error);
        alert("Setup failed. Please try again.");
      }

    } else {
      const userData = userSnap.data();
      if (!userData.firstName || !userData.birthDate) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleAuth = async (action: "login" | "signup") => {
    setLoading(true);
    try {
      let userCredential;
      if (action === "signup") {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleUserDestination(userCredential.user);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserDestination(result.user);
    } catch (error: any) {
      alert("Google Login Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 font-sans p-4">
      <Card className="w-full max-w-[400px] shadow-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-stone-800 dark:text-stone-100">OverTime Café</CardTitle>
          <CardDescription>Your calm space awaits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Join</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="member@overtime.lk" 
                  className="bg-white dark:bg-stone-900"
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-white dark:bg-stone-900"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <Button className="w-full bg-stone-800 hover:bg-stone-700 text-white" onClick={() => handleAuth("login")} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Enter"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-email">Email</Label>
                <Input id="s-email" type="email" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-password">Password</Label>
                <Input id="s-password" type="password" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button variant="outline" className="w-full" onClick={() => handleAuth("signup")} disabled={loading}>
                 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Create Membership"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200 dark:border-stone-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-500 dark:bg-stone-950">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon /> Sign in with Google
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}