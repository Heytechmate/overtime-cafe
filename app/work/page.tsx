"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Laptop, Users, Mic, Wifi, Power, CheckCircle2, AlertCircle, X, Loader2, Coffee } from "lucide-react";

export default function WorkPage() {
  const [selectedZone, setSelectedZone] = useState("silent");
  const [facilities, setFacilities] = useState<any>({});
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Auth Form State
  const [authTab, setAuthTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const zoneMapping: any = {
    silent: "quiet_zone",
    collab: "collab_zone",
    meeting: "meeting_pod"
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setShowLoginModal(false); 
    });

    const unsubs = [
      onSnapshot(doc(db, "facilities", "quiet_zone"), (d) => setFacilities((p:any) => ({...p, silent: d.data()}))),
      onSnapshot(doc(db, "facilities", "meeting_pod"), (d) => setFacilities((p:any) => ({...p, meeting: d.data()}))),
      onSnapshot(doc(db, "facilities", "collab_zone"), (d) => setFacilities((p:any) => ({...p, collab: d.data()}))),
    ];
    return () => { unsubAuth(); unsubs.forEach(u => u()); };
  }, []);

  const currentStatus = facilities[selectedZone];
  const isOccupied = currentStatus?.status === "Occupied";

  const handleBooking = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedDuration) return alert("Please select a duration.");
    
    setIsBooking(true);
    try {
      const zoneId = zoneMapping[selectedZone];
      await updateDoc(doc(db, "facilities", zoneId), {
        status: "Occupied",
        bookedBy: user.uid,
        bookedUntil: new Date(Date.now() + 3600000).toISOString()
      });
      alert(`Success! You booked the ${selectedZone} zone for ${selectedDuration}.`);
      setSelectedDuration(null);
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  // Auth Handler
  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authTab === "signup") {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          firstName: name.split(" ")[0],
          email: res.user.email,
          role: "member",
          coffeeCount: 0,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setAuthError("Invalid email or password.");
      else if (err.code === "auth/email-already-in-use") setAuthError("Email already in use.");
      else setAuthError("Error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const userDocRef = doc(db, "users", googleUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: googleUser.uid,
          firstName: googleUser.displayName?.split(" ")[0] || "Member",
          email: googleUser.email,
          role: "member",
          coffeeCount: 0,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(error);
      setAuthError("Google Sign-In failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-6 md:p-12 font-sans relative">
      
      {/* --- AUTH MODAL --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
           
           <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"><X size={20} /></button>

              <div className="p-8">
                 <div className="flex items-center gap-3 mb-6 justify-center">
                    <div className="h-12 w-12 bg-teal-50 rounded-full flex items-center justify-center"><Coffee className="h-6 w-6 text-teal-600" /></div>
                    <span className="font-bold text-xl text-stone-900 dark:text-stone-50">OverTime Access</span>
                 </div>

                 {/* FIXED: Controlled Tabs (value={authTab}) */}
                 <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-stone-100 p-1 rounded-lg mb-6">
                      <TabsTrigger value="login" className="text-sm font-bold">Login</TabsTrigger>
                      <TabsTrigger value="signup" className="text-sm font-bold">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* Form Fields */}
                    <div className="space-y-4">
                       {/* Name Field - Only for Sign Up */}
                       {authTab === "signup" && (
                         <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                           <Label className="text-sm">Full Name</Label>
                           <Input placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-10 bg-stone-50 border-stone-200"/>
                         </div>
                       )}
                       
                       <div className="space-y-1.5">
                         <Label className="text-sm">Email</Label>
                         <Input placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 bg-stone-50 border-stone-200"/>
                       </div>
                       
                       <div className="space-y-1.5">
                         <Label className="text-sm">Password</Label>
                         <Input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 bg-stone-50 border-stone-200"/>
                       </div>
                       
                       {authError && <p className="text-sm text-red-500 font-bold bg-red-50 p-2 rounded">{authError}</p>}

                       <Button onClick={handleAuth} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 mt-2 text-base" disabled={authLoading}>
                         {authLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : (authTab === "signup" ? "Create Account" : "Sign In")}
                       </Button>

                       <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-100"></span></div>
                          <div className="relative flex justify-center text-[10px] uppercase tracking-wider"><span className="bg-white px-2 text-stone-400">Or continue with</span></div>
                       </div>

                       <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-11 font-bold border-stone-200 hover:bg-stone-50" disabled={authLoading}>
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google
                       </Button>
                    </div>
                 </Tabs>
              </div>
              <div className="bg-stone-50 p-4 text-center text-xs text-stone-400 border-t border-stone-100">
                 Join the club to book zones & order coffee.
              </div>
           </div>
        </div>
      )}

      {/* --- PAGE HEADER & CONTENT (Same as before) --- */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="text-sm text-stone-500 hover:text-teal-600 mb-4 inline-block font-medium">← Back to Hub</Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50">Work Zones</h1>
            <p className="text-stone-500 mt-2 dark:text-stone-400">Choose your environment. Optimize your output.</p>
          </div>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-white dark:bg-stone-900 gap-1.5 py-1.5 px-3"><Wifi className="w-3.5 h-3.5 text-teal-600"/> Gigabit WiFi</Badge>
             <Badge variant="outline" className="bg-white dark:bg-stone-900 gap-1.5 py-1.5 px-3"><Power className="w-3.5 h-3.5 text-amber-500"/> Power @ Seat</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="silent" className="w-full" onValueChange={(val) => { setSelectedZone(val); setSelectedDuration(null); }}>
            <TabsList className="grid w-full grid-cols-3 bg-stone-200 dark:bg-stone-800 p-1 rounded-xl h-12">
              <TabsTrigger value="silent" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Deep Work</TabsTrigger>
              <TabsTrigger value="collab" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Collab</TabsTrigger>
              <TabsTrigger value="meeting" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Meeting Pods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="silent" className="mt-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="relative h-64 bg-stone-900 rounded-2xl overflow-hidden flex items-center justify-center border border-stone-800 shadow-inner">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-700 via-stone-900 to-black opacity-60" />
                 <div className="relative z-10 text-center">
                    <Laptop className="text-stone-600 w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-white">The Library Zone</h3>
                    <p className="text-stone-400 text-sm">Focus | Silence | Productivity</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FeatureCard icon={<Mic className="w-5 h-5 text-red-400"/>} title="Strictly Silent" desc="No calls allowed. Headphones only." />
                 <FeatureCard icon={<Users className="w-5 h-5 text-stone-400"/>} title="Single Occupancy" desc="Individual desks with dividers." />
              </div>
            </TabsContent>

            <TabsContent value="collab" className="mt-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="relative h-64 bg-stone-200 rounded-2xl overflow-hidden flex items-center justify-center border border-stone-300 shadow-inner">
                 <div className="absolute inset-0 bg-grid-stone-300/50 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                 <div className="relative z-10 text-center">
                    <Users className="text-stone-400 w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-stone-800">The Commons</h3>
                    <p className="text-stone-500 text-sm">Chat | Brainstorm | Coffee</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FeatureCard icon={<Mic className="w-5 h-5 text-teal-600"/>} title="Calls Allowed" desc="Take calls freely at your desk." />
                 <FeatureCard icon={<Users className="w-5 h-5 text-stone-400"/>} title="Group Tables" desc="Seats for teams of 4-6." />
              </div>
            </TabsContent>

            <TabsContent value="meeting" className="mt-6 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
               <div className="relative h-64 bg-teal-900 rounded-2xl overflow-hidden flex items-center justify-center border border-teal-800 shadow-inner">
                 <div className="relative z-10 text-center">
                    <Mic className="text-teal-500 w-16 h-16 mx-auto mb-4 opacity-80" />
                    <h3 className="text-2xl font-bold text-white">Soundproof Pods</h3>
                    <p className="text-teal-200 text-sm">Zoom Ready | Acoustic | Private</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FeatureCard icon={<Wifi className="w-5 h-5 text-teal-500"/>} title="Priority Bandwidth" desc="Dedicated line for video calls." />
                 <FeatureCard icon={<Power className="w-5 h-5 text-amber-400"/>} title="Studio Lighting" desc="Ring lights included." />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 sticky top-8">
          <Card className={`border-2 shadow-xl transition-all duration-300 overflow-hidden ${isOccupied ? 'border-red-100 bg-red-50/50' : 'border-stone-200 bg-white'}`}>
            <div className={`p-6 pb-2 ${isOccupied ? 'bg-red-50' : 'bg-white'} transition-colors border-b border-stone-100`}>
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-xl ${isOccupied ? 'text-red-900' : 'text-stone-900'}`}>
                        {isOccupied ? "Zone Occupied" : "Reserve Spot"}
                    </h3>
                    <p className={`text-sm mt-1 font-medium ${isOccupied ? 'text-red-700' : 'text-stone-500'}`}>
                        {isOccupied ? "Check back later." : `${selectedZone.replace('_', ' ')} zone`}
                    </p>
                  </div>
                  {isOccupied ? (
                      <AlertCircle className="text-red-600 w-6 h-6" />
                  ) : (
                      <CheckCircle2 className="text-teal-600 w-6 h-6" />
                  )}
               </div>
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                      {['2 Hrs', '4 Hrs', 'Day'].map((dur) => (
                          <button
                            key={dur}
                            onClick={() => setSelectedDuration(dur)}
                            disabled={isOccupied}
                            className={`py-2 text-sm font-medium rounded-lg border transition-all
                                ${selectedDuration === dur 
                                    ? 'bg-stone-900 text-white border-stone-900 shadow-md transform scale-105' 
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed'}
                            `}
                          >
                              {dur}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 flex justify-between items-center">
                  <span className="text-sm text-stone-500 font-medium">Credits Required</span>
                  <span className="text-lg font-bold text-stone-900">
                      {selectedDuration === '2 Hrs' ? '2' : selectedDuration === '4 Hrs' ? '3' : selectedDuration === 'Day' ? '5' : '-'}
                  </span>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
              <Button 
                  onClick={handleBooking}
                  disabled={isOccupied || (!selectedDuration && !!user) || isBooking}
                  className={`w-full h-12 text-base font-bold shadow-lg transition-all ${
                      isOccupied 
                      ? 'bg-stone-300 text-stone-500' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white hover:scale-[1.02] active:scale-95'
                  }`}
              >
                  {isBooking ? "Confirming..." : isOccupied ? "Unavailable" : user ? "Confirm Booking" : "Login to Book"}
              </Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="flex items-start gap-4 p-5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded-lg">{icon}</div>
            <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-200">{title}</h4>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}