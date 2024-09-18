'use client'

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Star, Trophy, Users } from "lucide-react"


const leaderboard = [
  { id: 1, user: "Ghost", aura: 1500, feedback: "Consistently provides crucial intel and innovative hacking strategies" },
  { id: 2, user: "Cipher", aura: 1200, feedback: "Masterful at cracking complex encryption algorithms" },
  { id: 3, user: "Nexus", aura: 1000, feedback: "Exceptional network infiltration techniques" },
]

const featuredProfiles = [
  { id: 1, name: "Cipher", aura: 1200, avatar: "/placeholder.svg?height=64&width=64", recentAchievement: "Code Breaker" },
  { id: 2, name: "Nexus", aura: 1000, avatar: "/placeholder.svg?height=64&width=64", recentAchievement: "Network Phantom" },
  { id: 3, name: "Ghost", aura: 1500, avatar: "/placeholder.svg?height=64&width=64", recentAchievement: "Shadow Infiltrator" },
]

import MatrixBackground from "./matrix-background";

export function HackerChatGame() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/getMessages');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.messages) {
        setMessages((prevMessages) => [...prevMessages, ...data.messages]);
      } else if (data.error) {
        console.error(data.error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Clean up on component unmount
    };
  }, []);

  return (
    (<div
      className="container mx-auto p-4 min-h-screen text-green400 font-mono relative">
      <MatrixBackground />
      <Card
        className="h-full w-full max-w-4xl mx-auto bg-black/90 border-green-400 shadow-[0_0_10px_#00ff00] bg-black bg-opacity-90">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-400 animate-pulse">Techfren Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="text-green-400">
            <TabsList className="grid w-full grid-cols-3 bg-black border border-green-400">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <MessageSquare className="w-4 h-4 mr-2" />
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="profiles"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <Users className="w-4 h-4 mr-2" />
                Operatives
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <Trophy className="w-4 h-4 mr-2" />
                Elite Hackers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <ChatTab messages={messages} />
            </TabsContent>
            <TabsContent value="profiles">
              <ProfilesTab featuredProfiles={featuredProfiles} />
            </TabsContent>
            <TabsContent value="leaderboard">
              <LeaderboardTab leaderboard={leaderboard} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>)
  );
}
import ChatTab from "./chat-tab";
import ProfilesTab from "./profiles-tab";
import LeaderboardTab from "./leaderboard-tab";
