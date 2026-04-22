"use client"
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import Link from "next/link"
import { Users, MessageSquare, TrendingUp, Clock, ArrowRight, Briefcase, MapPin, GraduationCap } from "lucide-react"

type AlumniType = {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  graduationYear: number;
  status: "PENDING" | "ACCEPTED";
};
type User = {
  id: string;
  name: string;
  role: string;
};

type Request = {
  id: string;
  student_id: string;
  alumni_id: string;
  status: "PENDING" | "ACCEPTED";
};




const EVENTS = [
  { id: 1, title: "Career Fair 2026", date: "Feb 15, 2026", type: "Networking" },
  { id: 2, title: "Alumni Mentorship Session", date: "Feb 20, 2026", type: "Workshop" },
  { id: 3, title: "Industry Talk: AI in Healthcare", date: "Feb 25, 2026", type: "Seminar" },
]

function StatCard({
  label,
  value,
  icon: Icon,
  change
}: {
  label: string;
  value: string;
  icon: any;
  change: string;
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-secondary mt-1">{value}</p>
            <p className="text-xs text-primary mt-1">{change}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AlumniCard({ alumni }: { alumni: AlumniType }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-lg font-semibold text-primary">{alumni.name.split(" ").map(n => n[0]).join("")}</span>
        </div>
        <div>
          <p className="font-medium text-secondary">{alumni.name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            <span>{alumni.role} at {alumni.company}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alumni.location}</span>
            <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />Class of {alumni.graduationYear}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge
          status={alumni.status === "ACCEPTED" ? "accepted" : "pending"}
        />
        {alumni.status === "ACCEPTED" && <Link href={`/chat/${alumni.id}`}><Button size="sm">Chat</Button></Link>}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: typeof EVENTS[0] }) {
  return (
    <div className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-secondary">{event.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{event.date}</p>
        </div>
        <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">{event.type}</span>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [user, setUser] = useState<any>(null);
  const [alumni, setAlumni] = useState<any[]>([]);

  // 1️⃣ Get logged-in user
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])


  // 2️⃣ Get users (alumni list)
  useEffect(() => {
    fetch("http://localhost:5000/api/users/alumni")
      .then(res => res.json())
      .then(data => {
        setUsers(data);

        // 🔥 THIS LINE IS IMPORTANT
        setAlumni(data.filter((u: any) => u.role?.toUpperCase() === "ALUMNI"));
      });
  }, []);


  // 3️⃣ Get requests (ONLY after user is ready)
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/api/mentorship/student/${user.id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("REQUESTS:", data);
        setRequests(Array.isArray(data) ? data : []);
      });

  }, [user]);

  const totalConnections = requests.length;
  const pending = requests.filter(r => r.status === "PENDING").length;
  const activeChats = requests.filter(r => r.status === "ACCEPTED").length;
  const sendRequest = async (alumniId: string) => {
    if (!user) return;

    try {
      const res = await fetch("http://localhost:5000/api/mentorship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          student_id: user.id,
          alumni_id: alumniId,
          message: "Hi, I'd like mentorship!"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(prev => [...prev, data]);
      }

    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-secondary">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">{"Here's what's happening in your alumni network today."}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Alumni Connections"
            value={String(totalConnections)}
            icon={Users}
            change="live"
          />
          <StatCard
            label="Pending Requests"
            value={String(pending)}
            icon={Clock}
            change="live"
          />
          <StatCard
            label="Active Chats"
            value={String(activeChats)}
            icon={MessageSquare}
            change="live"
          />
          <StatCard
            label="Community Posts"
            value="--"
            icon={TrendingUp}
            change="--"
          />
        </div>


        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Alumni</h2>
          </div>

          <div className="space-y-4">
            {alumni.map((a) => {
              const req = requests.find(r => r.alumni_id === a.id);

              return (
                <div
                  key={a.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-sm text-gray-500">{a.email}</p>
                  </div>

                  <button
                    onClick={() => sendRequest(a.id)}
                    disabled={!!req}
                    className={`px-4 py-1 rounded text-sm ${req
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white"
                      }`}
                  >
                    {req
                      ? req.status === "ACCEPTED"
                        ? "Connected"
                        : "Requested"
                      : "Request Mentorship"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="mt-6 border-0 shadow-md bg-secondary text-secondary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-semibold">Looking for Career Guidance?</h3>
                <p className="text-secondary-foreground/80 mt-1">Connect with alumni in your field for mentorship and advice.</p>
              </div>
              <Link href="/community"><Button className="bg-accent text-accent-foreground hover:bg-accent/90">Browse Alumni Directory</Button></Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
