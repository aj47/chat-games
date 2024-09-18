'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProfilesTab({ featuredProfiles }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {featuredProfiles.map((profile) => (
        <Card key={profile.id} className="bg-black border-green-400">
          <CardContent className="flex flex-col items-center p-6">
            <Avatar className="w-8 h-8 mb-4 border-2 border-green-400">
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
  );
}
