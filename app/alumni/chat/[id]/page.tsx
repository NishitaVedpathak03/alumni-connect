"use client"
import { io } from "socket.io-client";
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"


import {
  ArrowLeft,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  GraduationCap,
  Briefcase,
  MapPin,
  CheckCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useParams } from "next/navigation"


const socket = io("http://localhost:5000");


export default function ChatPage() {
  const [chatPartner, setChatPartner] = useState<any>(null);

  const [user, setUser] = useState<any>(null);

  const params = useParams();
  const chatId = params.id as string;
  console.log("CHAT ID:", chatId);

  useEffect(() => {
    if (!chatId) return;

    fetch(`http://localhost:5000/api/users/${chatId}`)
      .then(res => res.json())
      .then(data => setChatPartner(data))
  }, [chatId])


  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);
  const loadMessages = async () => {
    const res = await fetch(`http://localhost:5000/api/messages/${chatId}`);
    const data = await res.json();
    console.log("MESSAGES API:", data);
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_room", chatId);
  }, [chatId]);

  useEffect(() => {
    if (chatId) loadMessages();
  }, [chatId]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-h-[calc(100vh-4rem)]">
        <Card className="flex-1 border-0 shadow-md flex flex-col overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="border-b border-border p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/alumni/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Back</span>
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">SC</span>
                    </div>
                    {chatPartner?.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-secondary">{chatPartner?.name}</h2>
                    <p className="text-xs text-muted-foreground">{chatPartner?.lastSeen}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Phone className="h-5 w-5" />
                  <span className="sr-only">Voice call</span>
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Video className="h-5 w-5" />
                  <span className="sr-only">Video call</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Info className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      End Connection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Partner Info Card */}
            <div className="flex justify-center mb-6">
              <div className="bg-muted/50 rounded-xl p-4 max-w-sm text-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-semibold text-primary">SC</span>
                </div>
                <h3 className="font-serif font-semibold text-secondary">{chatPartner?.name}</h3>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                  <Briefcase className="h-3 w-3" />
                  {chatPartner?.role} at {chatPartner?.company}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Class of {chatPartner?.graduationYear}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {chatPartner?.location}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  You are now connected! Start your conversation below.
                </p>
              </div>
            </div>

            {/* Messages */}
            {Array.isArray(messages) && messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 ${message.sender_id === user?.id
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                    }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.message}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${message.sender_id === user?.id
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    <span
                      className={`text-xs ${message.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                    >
                      {message.timestamp}
                    </span>
                    {message.sender_id === user?.id && (
                      <CheckCheck
                        className={`h-3 w-3 ${message.read ? "text-primary-foreground" : "text-primary-foreground/50"
                          }`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!newMessage.trim()) return;

                const messageData = {
                  mentorship_id: chatId,
                  sender_id: user.id,
                  message: newMessage
                };

                // 🔹 Save in DB
                await fetch("http://localhost:5000/api/messages", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(messageData)
                });

                // 🔹 Send via socket
                socket.emit("send_message", {
                  ...messageData,
                  chatId: chatId
                });

                // 🔹 Update UI instantly
                setMessages(prev => [...prev, messageData]);
                setNewMessage("");
              }}
              className="flex items-center gap-2"
            >
              <Button variant="ghost" size="icon" type="button">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  )
}
