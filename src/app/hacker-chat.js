'use client'

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader} from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ShoppingCart, Star, Trophy, Users } from "lucide-react"
import { ElevenLabsClient, ElevenLabs } from "elevenlabs";

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
  const [leaderboard, setLeaderboard] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [processedTTSMessages, setProcessedTTSMessages] = useState({});

  useEffect(() => {
    console.log("Initial processedTTSMessages:", processedTTSMessages);
  }, [processedTTSMessages]);

  const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY });
  const audioRef = useRef(null);

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
    fetchLeaderboard();

    const messagesInterval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    const leaderboardInterval = setInterval(fetchLeaderboard, 120000); // Update leaderboard every 30 seconds

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
      clearInterval(messagesInterval);
      clearInterval(leaderboardInterval);
      clearInterval(processMessagesInterval);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/getLeaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleTTS = async (messageContent, username) => {
    console.log("handleTTS called with message:", messageContent);
    console.log("Current processedTTSMessages:", processedTTSMessages);

    // Find the message object in the messages array
    const messageObject = messages.find(msg => msg.chatmessage === messageContent);
    if (!messageObject || !messageObject.id) {
      console.error('Message object or ID not found');
      return;
    }

    if (processedTTSMessages[messageObject.id]) {
      console.warn(`Message with id ${messageObject.id} already processed for TTS, skipping.`);
      return;
    }

    try {
      // Get user points
      const pointsResponse = await fetch(`/api/userPoints?username=${encodeURIComponent(username)}`);
      const pointsData = await pointsResponse.json();
      
      if (pointsResponse.ok && pointsData.points >= 10) {
        console.log(`User ${username} has ${pointsData.points} points`);
        
        // Deduct points for TTS usage
        const updateResponse = await fetch('/api/userPoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, action: 'tts' })
        });
        
        if (updateResponse.ok) {
          console.log("Full message object:", messageObject);
          
          const lowercaseMessage = messageContent.toLowerCase();
          if (!lowercaseMessage.startsWith("!tts")) {
            console.error('Message does not start with !tts');
            return;
          }
          
          const ttsText = messageContent.slice(4).trim(); // Remove '!tts' from the message
          console.log("Text to be converted to speech:", ttsText);
          
          if (!ttsText) {
            console.error('No valid text to convert to speech after removing !tts');
            return;
          }
          const response = await elevenLabsClient.textToSpeech.convert("9BWtsMINqrJLrRacOk9x", {
            optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
            output_format: ElevenLabs.OutputFormat.Mp32205032,
            text: ttsText,
            voice_settings: {
              stability: 0.1,
              similarity_boost: 0.3,
              style: 0.2
            }
          });
          console.log(response);

          if (response && response.reader) {
            const chunks = [];
            while (true) {
              const { done, value } = await response.reader.read();
              if (done) break;
              chunks.push(value);
            }
            const audioBuffer = await new Blob(chunks).arrayBuffer();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);

            // Play the audio
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              audioRef.current.play();
            }

            // Mark the message as processed
            console.log("Adding message id to processedTTSMessages:", messageObject.id);
            setProcessedTTSMessages(prev => {
              const newObj = { ...prev, [messageObject.id]: true };
              console.log("Updated processedTTSMessages:", newObj);
              return newObj;
            });
          } else if (response instanceof ArrayBuffer) {
            // Handle the case where response is directly an ArrayBuffer
            const audioBlob = new Blob([response], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);

            // Play the audio
            if (audioRef.current) {
              audioRef.current.src = audioUrl;
              audioRef.current.play();
            }

            // Mark the message as processed
            setProcessedTTSMessages(prev => new Set(prev).add(message.id));
          } else {
            console.error('Unexpected response type from ElevenLabs API:', response);
          }
        } else {
          console.error('Failed to update user points');
        }
      } else {
        console.log(`User ${username} does not have enough points for TTS`);
      }
    } catch (error) {
      console.error('Error in handleTTS:', error);
    }
  };

  return (
    <div
      className="container mx-auto p-4 min-h-screen text-green400 font-mono relative">
      <MatrixBackground />
      <Card
        className="h-full w-full max-w-4xl mx-auto"
      >
        <CardHeader>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="text-green-400">
            <TabsList className="grid w-full grid-cols-3 bg-black border border-green-400">
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <MessageSquare className="w-4 h-4 mr-2" />
                Techfren Chat
              </TabsTrigger>
              <TabsTrigger
                value="shop"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-green-900 data-[state=active]:text-green-400">
                <Trophy className="w-4 h-4 mr-2" />
                Elite Hackers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="max-h-[calc(100vh-200px)] overflow-y-auto scrollable-container">
              <ChatTab 
                messages={messages ? messages.slice().reverse() : []} 
                onTTS={handleTTS}
                leaderboard={leaderboard}
              />
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
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
