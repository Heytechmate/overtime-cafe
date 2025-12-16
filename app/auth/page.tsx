"use client";

import { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc, runTransaction } from "firebase/firestore"; 
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// 🔒 STRICT ADMIN UID
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

  // ✅ CHECK FOR REDIRECT RESULT (When user comes back from Google on mobile)
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setLoading(true);
          await handleUserDestination(result.user);
        }
      } catch (error: any) {
        console.error("Redirect Login Error:", error);
        // Don't alert here, just log it. Redirect errors can be noisy.
      }
    };
    checkRedirect();
  }, []);

  const handleUserDestination = async (user: any) => {
    
    if (user.uid === ADMIN_UID) {
      router.push("/admin/dashboard");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      // ✅ CREATE NEW USER (With OT0001 ID)
      try {
        await runTransaction(db, async (transaction) => {
          const counterRef = doc(db, "counters", "members");
          const counterSnap = await transaction.get(counterRef);

          let newCount = 1;
          if (counterSnap.exists()) {
            newCount = counterSnap.data().count + 1;
          }

          const memberId = `OT${newCount.toString().padStart(4, '0')}`;

          transaction.set(counterRef, { count: newCount });
          transaction.set(userDocRef, {
            email: user.email,
            uid: user.uid,
            memberId: memberId,
            points: 0,
            tier: "Member",
            createdAt: new Date(),
            isProfileComplete: false
          });
        });
        
        router.push("/onboarding"); 
      } catch (error) {
        console.error("Setup failed: ", error);
        alert("Account setup failed. Please try again.");
      }

    } else {
      // ✅ EXISTING USER CHECK
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
    const provider = new GoogleAuthProvider();
    
    try {
      // 📱 TRY POPUP FIRST (Works on Desktop)
      const result = await signInWithPopup(auth, provider);
      await handleUserDestination(result.user);
    } catch (error: any) {
      // ⚠️ IF POPUP FAILS (Mobile/Blocker), TRY REDIRECT
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
          // Code stops here while page redirects to Google
        } catch (redirectError: any) {
          alert("Login failed: " + redirectError.message);
          setLoading(false);
        }
      } else {
        alert("Google Login Error: " + error.message);
        setLoading(false);
      }
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