"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PhoneOutgoing, ScrollText, Settings, LogOut, PanelLeftClose, PanelLeft, Menu, X, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Recovery Logs", href: "/dashboard/logs", icon: ScrollText },
    { label: "Call Transcripts", href: "/dashboard/transcripts", icon: ScrollText },
    { label: "Outbound Trigger", href: "/dashboard/outbound", icon: PhoneOutgoing },
    { label: "Meta Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { label: "Account Config", href: "/dashboard/config", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300 relative w-full">
      
      {/* Mobile Backdrop overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-gray-100 dark:bg-black border-r border-gray-200 dark:border-white/5 flex flex-col transition-all duration-300 fixed md:relative z-50 h-full",
        isCollapsed ? "w-72 md:w-[72px]" : "w-72 md:w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-gray-200 dark:border-white/5 transition-all shrink-0",
          isCollapsed ? "justify-center px-0" : "px-4 gap-3 justify-between md:justify-start"
        )}>
          {/* Toggle Button Desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:block p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          {/* Logo (Hidden when collapsed) */}
          {!isCollapsed && (
            <Link href="/" className="flex items-center overflow-hidden ml-2 gap-2.5">
              <img src="/logo.png" alt="Vision India Logo" className="h-[36px] w-auto object-contain shrink-0" />
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-sm uppercase text-gray-900 dark:text-white leading-tight">Vision India</span>
                <span className="text-[8px] tracking-widest uppercase font-bold text-[#E67E22]">Financial Solutions</span>
              </div>
            </Link>
          )}

          {/* Close Button Mobile */}
          {!isCollapsed && (
             <button 
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-md hover:bg-black/5 dark:hover:bg-white/10"
             >
               <X className="w-5 h-5" />
             </button>
          )}
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-visible px-3">
          {!isCollapsed && <div className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Admin Panel</div>}
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex items-center transition-colors uppercase tracking-wide rounded-xl group",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3.5 md:py-3",
                  isActive 
                    ? "bg-mahindra-red/10 text-mahindra-red" 
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                
                {/* Active Indicator Line */}
                {isActive && !isCollapsed && <div className="absolute right-0 top-0 bottom-0 w-1 bg-mahindra-red rounded-l-full" />}
                {isActive && isCollapsed && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-mahindra-red" />}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className={cn(
          "p-4 border-t border-gray-200 dark:border-white/5 flex transition-all", 
          isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"
        )}>
          <div className="relative group flex items-center justify-center">
            <ThemeToggle />
            {isCollapsed && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                Theme Settings
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
              </div>
            )}
          </div>
          
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); window.location.href = "/"; }} className={cn(
            "relative flex items-center transition-colors uppercase tracking-wide group rounded-md", 
            isCollapsed ? "justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10" : "gap-3 text-sm font-medium hover:text-black dark:text-gray-400 dark:hover:text-white"
          )}>
            <LogOut className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white" />
            {!isCollapsed && <span className="text-gray-500 hover:text-black dark:hover:text-white">Logout</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                Logout
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-gray-50 dark:bg-black transition-colors duration-300 relative z-0">
        
        {/* Mobile Top Bar */}
        <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-black shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center">
               <img src="/logo.png" alt="Vision India Logo" className="h-[32px] w-auto object-contain opacity-90" />
            </Link>
          </div>
          <ThemeToggle />
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}


