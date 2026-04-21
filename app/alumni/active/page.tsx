"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Mentorship {
    id: number
    student_name: string
    student_email: string
    student_id: string
}

interface Message {
    id: string
    sender_id: string
    sender_name: string
    message: string
    created_at: string
}

export default function ActiveMentorshipPage() {
    const [mentorships, setMentorships] = useState<Mentorship[]>([])
    const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [currentUser, setCurrentUser] = useState<any>(null)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Load User & Mentorships
    useEffect(() => {
        const user = localStorage.getItem("user")
        if (user) {
            const parsedUser = JSON.parse(user)
            setCurrentUser(parsedUser)
            // Pass ID as string or number depending on what parsedUser.id holds (likely string if UUID)
            fetchActiveMentorships(parsedUser.id)
        }
    }, [])

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Fetch mentorships when user selected (or new message sent)
    useEffect(() => {
        if (selectedMentorship) {
            fetchMessages(selectedMentorship.id)
            // Poll every 3 seconds for new messages (simple real-time sim)
            const interval = setInterval(() => fetchMessages(selectedMentorship.id), 3000)
            return () => clearInterval(interval)
        }
    }, [selectedMentorship])


    const fetchActiveMentorships = async (alumniId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/mentorship/active/${alumniId}`)
            if (res.ok) {
                const data = await res.json()
                setMentorships(data)
                if (data.length > 0 && !selectedMentorship) {
                    setSelectedMentorship(data[0]) // Select first by default
                }
            }
        } catch (err) {
            console.error(err)
        }
    }

    const fetchMessages = async (mentorshipId: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/messages/${mentorshipId}`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedMentorship || !currentUser) return

        try {
            const res = await fetch("http://localhost:5000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorship_id: selectedMentorship.id,
                    sender_id: currentUser.id,
                    message: newMessage
                })
            })

            if (res.ok) {
                setNewMessage("")
                fetchMessages(selectedMentorship.id) // Refresh immediately
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6">
            {/* Sidebar: List of Mentorships */}
            <Card className="w-1/3 border shadow-sm flex flex-col">
                <div className="p-4 border-b bg-muted/30">
                    <h2 className="font-semibold text-secondary">Active Mentorships</h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {mentorships.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => setSelectedMentorship(m)}
                                className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3",
                                    selectedMentorship?.id === m.id
                                        ? "bg-primary/10 border border-primary/20"
                                        : "hover:bg-muted"
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                        {m.student_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm text-secondary">{m.student_name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{m.student_email}</p>
                                </div>
                            </div>
                        ))}
                        {mentorships.length === 0 && (
                            <p className="text-sm text-muted-foreground p-4 text-center">No active mentorships yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1 border shadow-sm flex flex-col">
                {selectedMentorship ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {selectedMentorship.student_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-secondary">{selectedMentorship.student_name}</h3>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
                                        Active Now
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                            <div className="space-y-4">
                                {messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUser?.id
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[70%] p-3 rounded-2xl text-sm shadow-sm",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                                        : "bg-white border text-secondary rounded-bl-none"
                                                )}
                                            >
                                                <p>{msg.message}</p>
                                                <p className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 border-t bg-background flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                className="flex-1"
                            />
                            <Button onClick={sendMessage} size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a mentorship to start chatting
                    </div>
                )}
            </Card>
        </div>
    )
}
