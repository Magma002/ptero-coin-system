import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  PlaySquare, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  Bell,
  Coins
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/earn", label: "Earn Coins", icon: PlaySquare },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data, isLoading } = useUser();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!data?.user) {
    window.location.href = "/login";
    return null;
  }

  const user = data.user;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col glass-panel relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-foreground">CoinReward</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Topbar */}
        <header className="h-20 glass-panel border-r-0 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center md:hidden gap-3">
            <Coins className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            <span className="font-display text-lg font-bold">CoinReward</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="font-display text-2xl font-semibold capitalize">
              {location === "/" ? "Dashboard" : location.replace("/", "")}
            </h1>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
              <span className="font-bold text-lg">{(user.coins || user.balance).toLocaleString()}</span>
            </div>

            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold">{user.email.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
              <img 
                src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-primary/50"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-r-0 border-t border-white/5 flex justify-around p-3 z-50">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 p-2">
              <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px]", isActive ? "text-primary font-bold" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
