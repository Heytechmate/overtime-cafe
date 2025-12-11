import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar" // *Note: If using strict shadcn sidebar, or we build a custom one using simple Tailwind below for simplicity and speed.*
import { BookOpen, Coffee, Home, LayoutDashboard, LogOut, Moon, Settings, User } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-900 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-stone-950 border-r border-stone-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight text-stone-800 dark:text-stone-100">OverTime.</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active />
          <NavLink href="/dashboard/bookings" icon={<Moon size={20} />} label="Sleep Pods & Spaces" />
          <NavLink href="/menu" icon={<Coffee size={20} />} label="Order Food" />
          <NavLink href="/dashboard/community" icon={<BookOpen size={20} />} label="Community Events" />
          <NavLink href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-stone-500">Member Status</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

// Helper Component for Navigation Links
function NavLink({ href, icon, label, active = false }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active 
          ? "bg-stone-100 text-stone-900" 
          : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}