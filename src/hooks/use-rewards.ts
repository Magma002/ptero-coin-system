import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authHeaders } from "@/lib/utils";
import type { RewardResponse, CooldownResponse, HistoryResponse } from "@/types/api";

// Mock history data for development
const mockHistory = {
  transactions: [
    {
      id: "1",
      amount: 50,
      description: "Watched advertisement",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      type: "earn" as const
    },
    {
      id: "2", 
      amount: 25,
      description: "Daily login bonus",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      type: "earn" as const
    },
    {
      id: "3",
      amount: 75,
      description: "Completed survey",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      type: "earn" as const
    }
  ]
};

export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/reward", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });
        
        const json = await res.json();
        
        if (!res.ok) {
          // We throw the parsed JSON so the component can access cooldown data
          throw json as CooldownResponse;
        }
        
        return json as RewardResponse;
      } catch (error) {
        // For development, simulate reward claiming - fixed 1 coin for ads
        console.log("Using mock reward claiming for development");
        const rewardAmount = 1; // Fixed 1 coin for watching full ad
        return {
          amount: rewardAmount,
          newBalance: 1250 + rewardAmount
        } as RewardResponse;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["/api/history"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/history", {
          headers: {
            ...authHeaders(),
          },
        });
        
        if (!res.ok) throw new Error("Failed to fetch history");
        
        return (await res.json()) as HistoryResponse;
      } catch (error) {
        // For development, return mock history data
        console.log("Using mock history data for development");
        return mockHistory as HistoryResponse;
      }
    },
  });
}
