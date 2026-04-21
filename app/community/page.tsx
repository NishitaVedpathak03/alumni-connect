"use client"

import { Navigation } from "@/components/navigation"
import CommunityFeed from "@/components/community-feed"

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <CommunityFeed />
      </main>
    </div>
  )
}
