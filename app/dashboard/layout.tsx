"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Coffee, LayoutDashboard, Moon, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-900 font-sans">
      
      {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
      <aside className="w-64 bg-white dark:bg-stone-950 border-r border-stone-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">OverTime.</h2>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold">JD</div>
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-200">John Doe</p>
              <p className="text-xs text-stone-500">Member Status</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header (Visible only on Mobile) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-stone-200 bg-white dark:bg-stone-950">
           <span className="font-bold text-lg text-stone-900 dark:text-white">OverTime.</span>
           
           {/* Mobile Menu Trigger */}
           <Sheet>
             <SheetTrigger asChild>
               <Button variant="ghost" size="icon"><Menu className="w-6 h-6" /></Button>
             </SheetTrigger>
             <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-stone-950">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                  <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">OverTime.</h2>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                   <NavLinks />
                </nav>
             </SheetContent>
           </Sheet>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Reusable Navigation Links Component
function NavLinks() {
  return (
    <>
      <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
      <NavLink href="/dashboard/bookings" icon={<Moon size={20} />} label="Sleep Pods & Spaces" />
      <NavLink href="/menu" icon={<Coffee size={20} />} label="Order Food" />
      <NavLink href="/dashboard/community" icon={<BookOpen size={20} />} label="Community Events" />
      <NavLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
    </>
  );
}

// Link Component with Active State
function NavLink({ href, icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive 
          ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-white" 
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}