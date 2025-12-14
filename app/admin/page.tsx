"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

// 🔒 STRICT ADMIN UID
const ADMIN_UID = "opChtvs1YJghMgry81qKMyM2jlm2";

// Custom Google Icon
function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>
  );
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper to verify Admin UID
  const verifyAdmin = async (user: any) => {
    if (user.uid !== ADMIN_UID) {
      await signOut(auth); // Log out unauthorized users
      throw new Error("Access Denied: Your account is not authorized.");
    }
    router.push("/admin/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await verifyAdmin(userCredential.user);
    } catch (err: any) {
      alert("Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await verifyAdmin(result.user);
    } catch (err: any) {
      alert("Google Login Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900 font-sans">
      <Card className="w-[400px] shadow-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
            <ShieldCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-900 dark:text-stone-50">Admin Portal</CardTitle>
          <CardDescription>Restricted Access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" type="email" placeholder="admin@overtime.lk" 
                className="bg-stone-50 dark:bg-stone-900"
                onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" type="password" 
                className="bg-stone-50 dark:bg-stone-900"
                onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
            <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Access Dashboard"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-500 dark:bg-stone-950">Or</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon /> Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}