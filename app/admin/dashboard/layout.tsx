"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Coffee, Users, FileText, LogOut, Loader2 } from "lucide-react";

// 🔒 STRICT ADMIN UID
const ADMIN_UID = "opChtvs1YJghMgry81qKMyM2jlm2";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check for matching UID
      if (!user || user.uid !== ADMIN_UID) {
        router.push("/admin"); 
      } else {
        setLoading(false); 
      }
    });
    return () => unsubscribe();
  }, [router]);

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
          <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
          <AdminNavLink href="/admin/dashboard/menu" icon={<Coffee size={20} />} label="Menu Management" />
          <AdminNavLink href="/admin/dashboard/bookings" icon={<FileText size={20} />} label="Bookings" />
          <AdminNavLink href="/admin/dashboard/users" icon={<Users size={20} />} label="Members" />
        </nav>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

// Helper Component
function AdminNavLink({ href, icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400" 
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900 dark:hover:text-stone-200"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}