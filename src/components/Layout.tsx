import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  Monitor, 
  Activity, 
  FileUp, 
  Settings as SettingsIcon,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Live Logs', icon: Activity, path: '/live' },
    { name: 'Upload Logs', icon: FileUp, path: '/upload' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r">
      <div className="p-6 flex items-center gap-3 border-bottom">
        <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight">WebLog</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 h-11 px-4 transition-all duration-200 mb-1",
                  isActive ? "font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "")} />
                {item.name}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-bold text-primary">{user?.email[0].toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex w-72 flex-col">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                }
              />
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="hidden sm:flex items-center bg-muted/50 rounded-full px-3 py-1.5 border w-64 md:w-80 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Search logs, IPs, paths..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-card"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {theme === 'light' ? <Sun className="h-5 w-5" /> : 
                     theme === 'dark' ? <Moon className="h-5 w-5" /> : 
                     <Monitor className="h-5 w-5" />}
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
                  <Sun className="h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
                  <Moon className="h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
                  <Monitor className="h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
