import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useClaimReward } from "@/hooks/use-rewards";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

type AdStatus = 'idle' | 'watching' | 'rewarding' | 'cooldown';

export default function Earn() {
  const [status, setStatus] = useState<AdStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const claimMutation = useClaimReward();
  const { toast } = useToast();

  const handleWatchAd = () => {
    // Open placeholder ad
    window.open("https://replit.com", "_blank");
    
    setStatus('watching');
    setTimeLeft(10);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === 'watching' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (status === 'watching' && timeLeft === 0) {
      setStatus('rewarding');
      
      claimMutation.mutate(undefined, {
        onSuccess: (data) => {
          triggerConfetti();
          toast({
            title: "Reward Claimed!",
            description: `You earned ${data.coinsEarned} coins.`,
            className: "bg-green-500/20 border-green-500 text-white",
          });
          
          setStatus('cooldown');
          // Standard cooldown is 30s
          setTimeLeft(30);
        },
        onError: (err: any) => {
          if (err.secondsRemaining) {
            setStatus('cooldown');
            setTimeLeft(err.secondsRemaining);
            toast({
              title: "Cooldown Active",
              description: err.message,
              variant: "destructive",
            });
          } else {
            setStatus('idle');
            toast({
              title: "Error",
              description: err.message || "Failed to claim reward",
              variant: "destructive",
            });
          }
        }
      });
    } else if (status === 'cooldown' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (status === 'cooldown' && timeLeft === 0) {
      setStatus('idle');
    }

    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#06b6d4', '#facc15']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#06b6d4', '#facc15']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full p-10 md:p-16 rounded-[3rem] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                  <Play className="w-10 h-10 text-white ml-2" />
                </div>
                <h2 className="text-4xl font-display font-bold mb-4">Ready to Earn?</h2>
                <p className="text-muted-foreground mb-10 max-w-md text-lg">
                  Watch a quick 10-second advertisement to instantly receive 10 coins into your wallet.
                </p>
                <button 
                  onClick={handleWatchAd}
                  className="px-12 py-5 rounded-full bg-white text-black font-bold text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                >
                  Watch Ad & Earn Coins
                </button>
              </motion.div>
            )}

            {status === 'watching' && (
              <motion.div 
                key="watching"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="76" className="stroke-white/10" strokeWidth="8" fill="none" />
                    <motion.circle 
                      cx="80" cy="80" r="76" 
                      className="stroke-primary" 
                      strokeWidth="8" 
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "477 477", strokeDashoffset: 477 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  </svg>
                  <span className="text-5xl font-display font-bold neon-text">{timeLeft}</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Watching Ad...</h3>
                <p className="text-muted-foreground">Please do not close the ad tab</p>
              </motion.div>
            )}

            {status === 'rewarding' && (
              <motion.div 
                key="rewarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-primary"
              >
                <Loader2 className="w-20 h-20 animate-spin mb-6 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                <h3 className="text-2xl font-bold">Claiming Reward...</h3>
              </motion.div>
            )}

            {status === 'cooldown' && (
              <motion.div 
                key="cooldown"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 text-muted-foreground">
                  <Clock className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-4">Cooldown Active</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Next ad available in <span className="text-white font-bold">{timeLeft}</span> seconds
                </p>
                <button disabled className="px-10 py-4 rounded-full bg-white/10 text-muted-foreground font-semibold text-lg cursor-not-allowed border border-white/5">
                  Wait {timeLeft}s
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </AppLayout>
  );
}
