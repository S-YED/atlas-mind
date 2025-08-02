import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  Brain, 
  Trophy, 
  Settings, 
  User,
  BarChart3,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Courses", url: "/courses", icon: BookOpen },
  { title: "AI Tutor", url: "/ai-tutor", icon: Brain },
  { title: "Progress", url: "/progress", icon: BarChart3 },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium border-r-2 border-sidebar-primary" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-primary-glow rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-sidebar-primary to-primary-glow bg-clip-text text-transparent">
                EDAPT
              </h2>
              <p className="text-xs text-sidebar-foreground/70">EdTech Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sidebar-foreground/60 font-medium">
            {!isCollapsed && "Learning Hub"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mb-1">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <div className="px-4 py-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg mx-2 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">AI Tip</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete your daily learning streak to unlock AI-powered insights!
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}