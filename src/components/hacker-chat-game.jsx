'use client'

import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Star, Trophy, Users } from "lucide-react"

// Mock data
const messages = [
  { id: 1, user: "Cipher", content: "Initiating breach protocol...", rating: "good", feedback: "Engaging roleplay that sets the hacker atmosphere", aura: 5 },
  { id: 2, user: "Nexus", content: "What's our target system?", rating: "neutral", feedback: "On-theme question, but could be more specific", aura: 0 },
  { id: 3, user: "Ghost", content: "I've identified a vulnerability in the firewall!", rating: "excellent", feedback: "Excellent contribution to the hacking scenario", aura: 10 },
]

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

const MatrixBackground = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix-bg');
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = [];

    for (let x = 0; x < columns; x++) {
      rainDrops[x] = 1;
    }

    const draw = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.05)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = '#0F0';
      context.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        context.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 30);

    return () => clearInterval(interval);
  }, []);

  return <canvas id="matrix-bg" className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export function HackerChatGame() {
  return (
    (<div
      className="container mx-auto p-4 min-h-screen text-green400 font-mono relative">
      <MatrixBackground />
      <Card
        className="w-full max-w-4xl mx-auto bg-black/90 border-green-400 shadow-[0_0_10px_#00ff00]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-green-400 animate-pulse">The Hacker's Nexus</CardTitle>
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
              <ScrollArea className="h-[calc(100vh-200px)] rounded p-2">
                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div
                      className={`p-2 rounded ${
                        message.rating === "excellent" ? "bg-green-900/30" :
                        message.rating === "good" ? "bg-green-900/20" : ""
                      }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6 border border-green-400">
                          <AvatarFallback className="bg-green-900 text-green-400">{message.user[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{message.user}</span>
                        <span className="text-xs text-green-600">
                          {leaderboard.find(u => u.user === message.user)?.aura} Aura
                        </span>
                        {message.aura > 0 && (
                          <span className="text-xs text-green-400">+{message.aura} aura</span>
                        )}
                        {message.rating === "excellent" && (
                          <Badge variant="outline" className="border-green-400 text-green-400">
                            <Star className="w-3 h-3 mr-1" />
                            Elite
                          </Badge>
                        )}
                      </div>
                      <p className="text-green-300">{message.content}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-xs text-green-600 mt-1 cursor-help">
                            AI Analysis
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-green-400 text-green-400">
                          <p>{message.feedback}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="profiles">
              <div className="grid gap-6 md:grid-cols-3">
                {featuredProfiles.map((profile) => (
                  <Card key={profile.id} className="bg-black border-green-400">
                    <CardContent className="flex flex-col items-center p-6">
                      <Avatar className="w-24 h-24 mb-4 border-2 border-green-400">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback className="bg-green-900 text-green-400">{profile.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg text-green-400">{profile.name}</h3>
                      <p className="text-sm text-green-600">{profile.aura} Aura</p>
                      <Badge variant="outline" className="mt-2 border-green-400 text-green-400">{profile.recentAchievement}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="leaderboard">
              <ScrollArea className="h-[calc(100vh-200px)] border border-green-400 rounded p-2">
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
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>)
  );
}
