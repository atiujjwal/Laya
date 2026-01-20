"use client";

import React, { useState } from "react";
import { Avatar } from "../atoms/Avatar";
import { MonthNavigator } from "../molecules/MonthNavigator";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string };
  currentDate: Date;
  onDateChange: (direction: "next" | "prev") => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  currentDate,
  onDateChange,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: "Habits", href: "/dashboard", icon: LayoutDashboard },
    { name: "Goals", href: "/dashboard/goals", icon: Target },
    { name: "Planner", href: "/dashboard/planner", icon: CalendarDays },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {/* 1. Sidebar */}
      <aside
        className={cn(
          "bg-background border-r flex flex-col transition-all duration-300 z-50 fixed md:relative h-full",
          isSidebarOpen ? "w-64" : "w-0 md:w-20 overflow-hidden",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            {isSidebarOpen && <span>Laya</span>}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 w-full transition-colors",
              !isSidebarOpen && "justify-center",
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-accent rounded-md md:hidden"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>

            {/* Month Navigator controls the Global Date State */}
            <MonthNavigator
              currentDate={currentDate}
              onNext={() => onDateChange("next")}
              onPrev={() => onDateChange("prev")}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile Dropdown Placeholder */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Avatar src={user.image} fallback={user.name || "U"} />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
