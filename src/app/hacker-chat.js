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

import MatrixBackground from "../components/matrix-background";
import ChatTab from "../components/chat-tab";
import ProfilesTab from "../components/profiles-tab";
import LeaderboardTab from "../components/leaderboard-tab";

export function HackerChatGame() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/getMessages');
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds

    const processMessagesInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/processMessages');
        if (!response.ok) {
          console.error('Error processing messages:', response.status);
        }
      } catch (error) {
        console.error('Error processing messages:', error);
      }
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
      clearInterval(processMessagesInterval);
    };
  }, []);

  return (
    <div
      className="container mx-auto p-4 min-h-screen text-green400 font-mono relative">
      <MatrixBackground />
      <Card
        className="h-full w-full max-w-4xl mx-auto"
      >
        <CardHeader>
          <CardTitle className="text-2xl text-center">Techfren Chat</CardTitle>
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
            <TabsContent value="chat" className="max-h-[calc(100vh-200px)] overflow-y-auto scrollable-container">
              <ChatTab messages={messages? messages.slice().reverse() : []} />
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
    </div>
  );
}
