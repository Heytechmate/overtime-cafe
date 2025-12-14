"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Globe, Loader2 } from "lucide-react";

// Custom Google Icon
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

  const handleAuth = async (action: "login" | "signup") => {
    setLoading(true);
    try {
      if (action === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
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
            
            {/* Login Form */}
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

            {/* Sign Up Form */}
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200 dark:border-stone-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-500 dark:bg-stone-950">Or continue with</span></div>
          </div>

          {/* Google Button */}
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
            <GoogleIcon /> Sign in with Google
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}