import { AppLayout } from "@/components/AppLayout";
import { useHistory } from "@/hooks/use-rewards";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { History as HistoryIcon, ArrowUpRight, Search } from "lucide-react";

export default function History() {
  const { data, isLoading } = useHistory();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground mt-1">Track all your earnings and activities</p>
          </div>
          
          <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Earned All Time</p>
              <p className="text-xl font-bold text-white">
                {isLoading ? "..." : data?.totalEarned.toLocaleString()} Coins
              </p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Transaction ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Date & Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Action</th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 w-24 bg-white/10 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-32 bg-white/10 rounded"></div></td>
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-white/10 rounded"></div></td>
                      <td className="px-6 py-5 text-right"><div className="h-4 w-16 bg-white/10 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : data?.history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  data?.history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5 text-sm font-mono text-muted-foreground">
                        #{entry.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-5 text-sm text-foreground">
                        {format(new Date(entry.createdAt), "MMM d, yyyy • h:mm a")}
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-green-400">
                        +{entry.coinsEarned}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-white/10 flex justify-center">
            <button className="px-6 py-2 text-sm text-muted-foreground hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-xl">
              Load More
            </button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
