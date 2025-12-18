"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, runTransaction } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Chrome } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const router = useRouter();

  // --- HELPER 1: GENERATE MEMBER ID ---
  const generateMemberId = async () => {
    const counterRef = doc(db, "counters", "members");
    try {
      const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? counterDoc.data().count : 0;
        const nextCount = currentCount + 1;
        transaction.set(counterRef, { count: nextCount }, { merge: true });
        return nextCount;
      });
      return `OT${String(newId).padStart(4, '0')}`;
    } catch (error) {
      console.error("Error generating ID:", error);
      return `OT-${Date.now().toString().slice(-4)}`;
    }
  };

  // --- HELPER 2: ROLE-BASED REDIRECT ---
  const handleRoleRedirect = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // CHECK ROLE
        if (userData.role === "admin") {
          router.push("/admin/dashboard"); // Admin -> Admin Panel
        } else {
          router.push("/dashboard"); // Member -> Member Hub
        }
      } else {
        router.push("/dashboard"); // Fallback
      }
    } catch (e) {
      console.error("Redirect Error", e);
      router.push("/dashboard");
    }
  };

  // 1. Email/Password Logic
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Check role before redirecting
        await handleRoleRedirect(userCredential.user.uid);
      } else {
        // SIGN UP
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const memberId = await generateMemberId();

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          memberId: memberId,
          name: name,
          email: email,
          phone: phone, 
          role: "member", // Default is member
          joinedAt: new Date().toISOString(),
          isProfileComplete: true
        });
        
        router.push("/dashboard"); // New users always go to dashboard first
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Sign-In Logic
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // NEW USER -> Generate ID -> Onboarding
        const memberId = await generateMemberId();
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          memberId: memberId,
          name: user.displayName || "",
          email: user.email || "",
          role: "member",
          joinedAt: new Date().toISOString(),
          isProfileComplete: false
        });
        router.push("/onboarding");
      } else {
        // EXISTING USER -> Check Role
        const data = docSnap.data();
        
        // If they haven't finished onboarding, send them back there
        if (!data.isProfileComplete) {
           router.push("/onboarding");
           return;
        }

        // If they are Admin, send to Admin Panel
        if (data.role === "admin") {
           router.push("/admin/dashboard");
        } else {
           router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error(error);
      alert("Google Sign-In Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">OverTime Café</CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back, member." : "Join the club today."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Chrome className="w-4 h-4 text-stone-900"/>}
              Sign {isLogin ? "in" : "up"} with Google
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-500">Or continue with</span></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input id="phone" placeholder="077 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-stone-900" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Login" : "Create Account")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-stone-500">{isLogin ? "New here? " : "Already have an account? "}</span>
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-teal-600 hover:underline">
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}