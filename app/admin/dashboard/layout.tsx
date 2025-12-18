"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; // Import database tools
import { auth, db } from "@/lib/firebase";
import { LayoutDashboard, Coffee, Users, FileText, LogOut, Loader2, Gamepad2, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 🔒 SUPER ADMIN UID
const SUPER_ADMIN_UID = "opChtvs1YJghMgry81qKMyM2jlm2";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth"); // Send to login if not signed in
        return;
      }

      // 1. Allow Super Admin immediately
      if (user.uid === SUPER_ADMIN_UID) {
        setLoading(false);
        return;
      }

      // 2. Check Database Role for others
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setLoading(false); // Allow access
        } else {
          router.push("/"); // Kick out if not admin
        }
      } catch (error) {
        console.error("Error verifying admin:", error);
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); 
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-900 font-sans">
      <aside className="w-64 bg-white dark:bg-stone-950 border-r border-stone-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            OverTime <span className="text-teal-600">Admin</span>
          </h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <AdminNavLink href="/admin/dashboard" exact icon={<LayoutDashboard size={20} />} label="Live Ops" />
          <AdminNavLink href="/admin/dashboard/bookings" icon={<FileText size={20} />} label="Bookings" />
          <AdminNavLink href="/admin/dashboard/games" icon={<Gamepad2 size={20} />} label="Game Library" />
          <AdminNavLink href="/admin/dashboard/planner" icon={<Calendar size={20} />} label="Holiday Planner" />
          
          <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800">
             <p className="px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Management</p>
             <AdminNavLink href="/admin/dashboard/menu" icon={<Coffee size={20} />} label="Menu & Orders" />
             <AdminNavLink href="/admin/dashboard/users" icon={<Users size={20} />} label="Members" />
          </div>
        </nav>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, icon, label, exact = false }: { href: string; icon: any; label: string, exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-teal-50 text-teal-700" : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"}`}>
      {icon}{label}
    </Link>
  );
}