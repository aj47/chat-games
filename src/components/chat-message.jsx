"use client";

import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sanitizeHtml } from "@/lib/sanitize-html";

export default function ChatMessage({ message, onTTS }) {
  useEffect(() => {
    if (message.chatmessage.startsWith('!tts')) {
      onTTS(message.chatmessage, message.chatname);
    }
  }, [message, onTTS]);

  return (
    <div key={message.id} className="mb-2">
      <div
        className={`p-1 rounded ${
          message.type === "excellent"
            ? "bg-green-900/30"
            : message.type === "good"
            ? "bg-green-900/20"
            : ""
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="w-6 h-6 border border-green-400">
            <AvatarImage src={message.chatimg} alt={message.chatname} />
            <AvatarFallback className="bg-green-900 text-green-400">
              {message.chatname[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-between w-full">
            <span
              className="font-semibold"
              style={{ color: message.nameColor }}
            >
              {message.chatname}
              {message.membership && (
                <Badge
                  variant="outline"
                  className="border-green-400 text-green-400 ml-1"
                >
                  {message.membership}
                </Badge>
              )}
            </span>
            <span className="text-green-600">
              ({message.points}
              {message.rating > 6 && (
                <span className="text-yellow-400 ml-1">+10</span>
              )})
            </span>
          </div>
          {/* {message.chatbadges && JSON.parse(message.chatbadges).map((badge, index) => (
            <img key={index} src={badge} alt="Badge" className="w-4 h-4" />
          ))} */}
        </div>
        <div 
          className="text-green-300" 
          style={{ color: message.textColor }}
          dangerouslySetInnerHTML={sanitizeHtml(message.chatmessage)}
        />
        {message.hasDonation && (
          <div className="mt-1 p-1 rounded bg-yellow-900/30 text-yellow-400">
            <span className="font-semibold">Donation: </span>
            {message.hasDonation}
          </div>
        )}
      </div>
      {message.subtitle && (
        <div className="text-xs text-green-600 mt-1">
          <div className="mt-1 p-1 rounded bg-green-900/30 text-green-400">
            <span className="font-semibold">
              AI Rating {message.rating}/10:{" "}
            </span>
            {message.subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
