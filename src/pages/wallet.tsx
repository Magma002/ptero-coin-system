import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";
import { Coins, ArrowRightLeft, Download, ShieldCheck, CreditCard } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export default function Wallet() {
  const { data: userData } = useUser();
  const user = userData?.user;

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Balance Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-10 relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-gradient-to-tl from-primary/20 to-secondary/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-muted-foreground text-lg mb-2">Total Wallet Balance</p>
              <div className="flex items-end gap-4">
                <h1 className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                  <AnimatedCounter value={user.coins} />
                </h1>
                <span className="text-2xl text-primary font-bold mb-2 md:mb-4">Coins</span>
              </div>
              <p className="text-sm text-green-400 mt-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> SECURE & VERIFIED
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none">
                <ArrowRightLeft className="w-5 h-5" />
                Convert
              </button>
              <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold neon-glow hover:scale-105 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none">
                <Download className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center mb-6">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Withdraw to Crypto</h3>
            <p className="text-muted-foreground mb-6">Convert your earned coins to popular cryptocurrencies like BTC, ETH, or USDT.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-muted-foreground">Minimum Withdrawal</span>
                <span className="font-bold text-white">5,000 Coins</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                Setup Crypto Wallet
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Convert to Gift Cards</h3>
            <p className="text-muted-foreground mb-6">Exchange your coins for digital gift cards from top retailers worldwide.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-muted-foreground">Minimum Conversion</span>
                <span className="font-bold text-white">10,000 Coins</span>
              </div>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                Browse Gift Cards
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </AppLayout>
  );
}
