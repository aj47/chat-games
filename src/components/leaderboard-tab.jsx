'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy } from "lucide-react"

export default function LeaderboardTab({ leaderboard }) {
  return (
    <div className="scrollable-container border border-green-400 rounded p-2">
      {leaderboard.map((user, index) => (
        <div
          key={user.id}
          className="flex items-center gap-4 mb-4 p-2 bg-green-900/20 rounded">
          <span className="font-bold text-2xl text-green-400 w-8">{index + 1}.</span>
          <Avatar className="w-12 h-12 border border-green-400">
            <AvatarFallback className="bg-green-900 text-green-400">{user.user[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-green-400">{user.user}</h3>
            <p className="text-sm text-green-600">{user.aura} Aura</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Trophy className="w-6 h-6 text-green-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black border-green-400 text-green-400">
                <p className="max-w-xs">{user.feedback}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
}
