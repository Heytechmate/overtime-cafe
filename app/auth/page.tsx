"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleAuth = async (action: "login" | "signup") => {
    try {
      if (action === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        // TODO: Add user to Firestore with "Member" role
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/menu"); // Redirect to menu after success
    } catch (error: any) {
      alert(error.message); // In production, we use nice Toasts, not alerts
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
      <Card className="w-[400px] shadow-xl border-stone-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-stone-800">OverTime Café</CardTitle>
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
                <Input id="email" type="email" placeholder="member@overtime.lk" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button className="w-full bg-stone-800 hover:bg-stone-700" onClick={() => handleAuth("login")}>
                Enter
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
              <Button variant="outline" className="w-full" onClick={() => handleAuth("signup")}>
                Create Membership
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}