"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"; // Added setDoc, onSnapshot
import { auth, db } from "@/lib/firebase";
import { LayoutDashboard, Coffee, Users, FileText, LogOut, Loader2, Gamepad2, Calendar, ShoppingBag, Store, Zap } from "lucide-react"; // Added Icons
import Link from "next/link";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState({ isOpen: false });
  const [gamingStatus, setGamingStatus] = useState({ ps5_available: false });
  const router = useRouter();

  useEffect(() => {
    // 1. Auth Check
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth"); 
        return;
      }
      try {
        const SUPER_ADMIN = "opChtvs1YJghMgry81qKMyM2jlm2";
        let isAdmin = user.uid === SUPER_ADMIN;
        
        if (!isAdmin) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") isAdmin = true;
        }
        
        if (isAdmin) setLoading(false);
        else router.push("/dashboard");
      } catch (error) { router.push("/"); }
    });

    // 2. Real-time Listeners for Sidebar Controls
    const unsubStore = onSnapshot(doc(db, "settings", "storeStatus"), (d) => {
      if (d.exists()) setStoreStatus(d.data() as any);
    });
    const unsubGame = onSnapshot(doc(db, "facilities", "gaming"), (d) => {
      if (d.exists()) setGamingStatus(d.data() as any);
    });

    return () => { unsubscribeAuth(); unsubStore(); unsubGame(); };
  }, [router]);

  // Toggle Handlers
  const toggleStore = async (val: boolean) => {
    await setDoc(doc(db, "settings", "storeStatus"), { isOpen: val, message: val ? "Open." : "Closed." }, { merge: true });
  };
  const togglePS5 = async (val: boolean) => {
    await setDoc(doc(db, "facilities", "gaming"), { ps5_available: val }, { merge: true });
  };

  const handleLogout = async () => { await signOut(auth); router.push("/"); };

  if (loading) return <div className="h-screen flex items-center justify-center bg-stone-50"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="flex h-screen bg-stone-50 font-sans text-stone-900">
      <aside className="w-64 bg-white border-r border-stone-200 hidden md:flex flex-col z-50">
        {/* HEADER */}
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            OverTime <span className="text-teal-600">Admin</span>
          </h2>
        </div>

        {/* GLOBAL CONTROLS (Moved here) */}
        <div className="px-4 py-6 border-b border-stone-100 bg-stone-50/50 space-y-4">
           <div>
             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">Store Status</p>
             <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${storeStatus.isOpen ? "bg-teal-50 border-teal-200" : "bg-white border-stone-200"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? "bg-teal-500" : "bg-red-400"}`} />
                  <span className={`text-xs font-bold ${storeStatus.isOpen ? "text-teal-700" : "text-stone-500"}`}>
                    {storeStatus.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <Switch checked={storeStatus.isOpen} onCheckedChange={toggleStore} className="scale-75 data-[state=checked]:bg-teal-600" />
             </div>
           </div>

           <div>
             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">Facilities</p>
             <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-stone-200">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={14} className={gamingStatus.ps5_available ? "text-stone-800" : "text-stone-300"} />
                  <span className="text-xs font-bold text-stone-700">PS5</span>
                </div>
                <Switch checked={gamingStatus.ps5_available} onCheckedChange={togglePS5} className="scale-75 data-[state=checked]:bg-stone-800" />
             </div>
           </div>
        </div>
        
        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <AdminNavLink href="/admin/dashboard" exact icon={<LayoutDashboard size={18} />} label="Live Queue" />
          <AdminNavLink href="/admin/dashboard/bookings" icon={<FileText size={18} />} label="Bookings" />
          <AdminNavLink href="/admin/dashboard/orders" icon={<ShoppingBag size={18} />} label="Order History" />
          
          <div className="pt-4 mt-4 border-t border-stone-100">
             <p className="px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Management</p>
             <AdminNavLink href="/admin/dashboard/users" icon={<Users size={18} />} label="Members" />
             <AdminNavLink href="/admin/dashboard/menu" icon={<Coffee size={18} />} label="Menu" />
             <AdminNavLink href="/admin/dashboard/games" icon={<Gamepad2 size={18} />} label="Games Library" />
             <AdminNavLink href="/admin/dashboard/planner" icon={<Calendar size={18} />} label="Event Planner" />
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-stone-100">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label, exact = false }: { href: string; icon: any; label: string, exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-stone-900 text-white shadow-sm" 
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}