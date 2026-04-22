"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Clock, CheckCircle2, MessageSquare, Briefcase, Calendar } from "lucide-react"
import { useEffect, useState } from "react"



function RequestCard({ request }: { request: any }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-accent-foreground">{(request.alumni_name || "User").split(" ").map((n: string) => n[0]).join("")}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-secondary">{request.alumni_name}</h3>
              <StatusBadge status="pending" />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{request.alumni_email}</span>
              <span>Class of {request.graduationYear}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{`"${request.message}"`}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Sent{new Date(request.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConnectionCard({ connection }: { connection: any }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {(connection.alumni_name || "User")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-secondary">{connection.alumni_name}</h3>
                <StatusBadge status="accepted" />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2"><Briefcase className="h-3 w-3" />{connection.alumni_email}</div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Class of {connection.graduationYear}</span>
                <span>Connected {connection.acceptedAt}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <Link href={`/chat/${connection.id}`}>
            <Button size="sm"><MessageSquare className="h-4 w-4 mr-2" />Open Chat</Button></Link>
            <p className="text-xs text-muted-foreground max-w-xs text-right truncate">Last message: {connection.lastMessageAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ChatRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])

  useEffect(() => {
    if (!user) return

    fetch(`http://localhost:5000/api/mentorship/student/${user.id}`)
      .then(res => res.json())
      .then(data => setRequests(data))
  }, [user])

  const pending = Array.isArray(requests)
    ? requests.filter(r => r.status === "PENDING")
    : [];

  const accepted = Array.isArray(requests)
    ? requests.filter(r => r.status === "ACCEPTED")
    : [];
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-secondary">Mentorship Requests</h1>
          <p className="text-muted-foreground mt-1">Track your outgoing mentorship requests to alumni</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center"><Clock className="h-6 w-6 text-amber-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{pending.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Acceptance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{accepted.length}</p>
                  <p className="text-sm text-muted-foreground">Accepted Mentors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Accepted ({accepted.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.map(req => <RequestCard key={req.id} request={req} />)}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {accepted.map(req => <ConnectionCard key={req.id} connection={req} />)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
