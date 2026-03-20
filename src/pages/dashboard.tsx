import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/hooks/use-user";
import { useHistory } from "@/hooks/use-rewards";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Coins, TrendingUp, PlaySquare, ArrowRight, Clock, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: userData } = useUser();
  const { data: historyData } = useHistory();

  const user = userData?.user;
  const recentHistory = historyData?.transactions.slice(0, 5) || [];
  
  const dailyLimit = 500;
  const userCoins = user?.coins || user?.balance || 0;
  const userDailyEarnings = user?.dailyEarnings || 150;
  const progressPercent = Math.min(100, (userDailyEarnings / dailyLimit) * 100);

  if (!user) return null;

  return (
    <AppLayout>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Total Coins Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-8 glass-card rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <p className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                Available Balance
              </p>
              <h2 className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                <AnimatedCounter value={userCoins} />
              </h2>
            </div>
            
            <Link href="/earn" className="shrink-0 w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg neon-glow hover:scale-105 transition-all flex items-center justify-center gap-3">
                <PlaySquare className="w-6 h-6" />
                Watch Ad
              </button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Daily Earnings Limit</span>
                <span className="font-bold text-white">{userDailyEarnings} / {dailyLimit}</span>
              </div>
              <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-secondary to-primary relative"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Earned Today</p>
                <p className="text-xl font-bold text-white">+{userDailyEarnings}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 space-y-6"
        >
          <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg">Recent Activity</h3>
              <Link href="/history" className="text-primary text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4 flex-1">
              {recentHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50 py-10">
                  <Star className="w-8 h-8 mb-2" />
                  <p>No activity yet</p>
                </div>
              ) : (
                recentHistory.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    key={item.id} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <PlaySquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-400">+{item.amount}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
