import { AppLayout } from "@/components/AppLayout";
import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";
import { User, Mail, Lock, Shield, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: userData } = useUser();
  const { toast } = useToast();
  
  const user = userData?.user;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
      className: "bg-green-500/20 border-green-500 text-white",
    });
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Navigation/Tabs (Desktop) */}
          <div className="lg:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-medium text-left">
              <User className="w-5 h-5" />
              Profile details
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium text-left">
              <Shield className="w-5 h-5" />
              Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium text-left">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-primary w-5 h-5" />
                Profile Information
              </h2>
              
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/10">
                <div className="relative">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/avatar.png`} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-white/10 object-cover"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-2 border-background hover:scale-110 transition-transform">
                    <User className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.email.split('@')[0]}</h3>
                  <p className="text-muted-foreground text-sm">Member since {new Date(user.createdAt || Date.now()).getFullYear()}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input 
                      type="email" 
                      defaultValue={user.email}
                      readOnly
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground ml-1">Email cannot be changed directly.</p>
                </div>

                <div className="space-y-2 pt-4">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-t border-white/10 pt-8">
                    <Lock className="text-primary w-5 h-5" />
                    Change Password
                  </h2>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Current password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="New password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold neon-glow hover:scale-105 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          
        </div>
      </div>
    </AppLayout>
  );
}
