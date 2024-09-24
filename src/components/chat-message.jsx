'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ChatMessage({ message }) {
  return (
    <div key={message.id} className="mb-2">
      <div className={`p-1 rounded ${
        message.type === "excellent" ? "bg-green-900/30" :
        message.type === "good" ? "bg-green-900/20" : ""
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="w-6 h-6 border border-green-400">
            <AvatarImage src={message.chatimg} alt={message.chatname} />
            <AvatarFallback className="bg-green-900 text-green-400">{message.chatname[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold" style={{ color: message.nameColor }}>
            {message.chatname} {message.aura && <span className="text-green-600">({message.aura})</span>}
          </span>
          {/* {message.chatbadges && JSON.parse(message.chatbadges).map((badge, index) => (
            <img key={index} src={badge} alt="Badge" className="w-4 h-4" />
          ))} */}
          {message.membership && (
            <Badge variant="outline" className="border-green-400 text-green-400">
              {message.membership}
            </Badge>
          )}
        </div>
        <p className="text-green-300" style={{color: message.textColor}}>{message.chatmessage}</p>
        {message.hasDonation && (
          <div className="mt-1 p-1 rounded bg-yellow-900/30 text-yellow-400">
            <span className="font-semibold">Donation: </span>
            {message.hasDonation}
          </div>
        )}
      </div>
      {message.subtitle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-green-600 mt-1 cursor-help">
                AI Analysis
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-green-400 text-green-400">
              <p>{message.subtitle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
