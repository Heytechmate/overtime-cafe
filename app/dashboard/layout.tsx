"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Removed 'db' as we don't fetch here anymore
import { LayoutDashboard, Coffee, Gamepad2, Mic, BookOpen, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MemberDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // We only check if logged in. We don't fetch profile data here anymore.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth"); 
      } else {
        setLoading(false);
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
        {/* HEADER */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            OverTime <span className="text-teal-600">Club</span>
          </h2>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <MemberNavLink href="/dashboard" exact icon={<LayoutDashboard size={18} />} label="Overview" />
          <MemberNavLink href="/menu" icon={<Coffee size={18} />} label="Order Coffee" />
          <MemberNavLink href="/gaming" icon={<Gamepad2 size={18} />} label="Gaming Lounge" />
          <MemberNavLink href="/pods" icon={<BookOpen size={18} />} label="Sleep Pods" />
          <MemberNavLink href="/creative" icon={<Mic size={18} />} label="Creative Studio" />
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}

function MemberNavLink({ href, icon, label, exact = false }: { href: string; icon: any; label: string, exact?: boolean }) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-teal-50 text-teal-700" : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"}`}>
      {icon}{label}
    </Link>
  );
}