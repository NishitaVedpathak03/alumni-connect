"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    MessageSquare,
    ThumbsUp,
    Share2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Post {
    id: string
    content: string
    created_at: string
    user_name: string
    user_role: string
    user_id?: string
}

export default function CommunityFeed() {
    const [posts, setPosts] = useState<Post[]>([])
    const [newPostContent, setNewPostContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [alumni, setAlumni] = useState<any[]>([])
    type Request = {
        alumni_id: string;
        status: "PENDING" | "ACCEPTED";
    };

    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        fetch(`http://localhost:5000/api/mentorship/student/${currentUser.id}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setRequests(Array.isArray(data) ? data : []));
    }, [currentUser]);

    useEffect(() => {
        fetch("http://localhost:5000/api/alumni")
            .then(res => res.json())
            .then(data => setAlumni(data))
            .catch(err => console.error(err))
    }, [])

    const sendRequest = async (alumniId: string) => {
        console.log("CLICKED", alumniId);
        if (!currentUser) {
            console.log("USER NOT LOADED");
            return;
        }
        try {
            const res = await fetch("http://localhost:5000/api/mentorship", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",
                body: JSON.stringify({
                    student_id: currentUser.id,
                    alumni_id: alumniId,
                    message: "Hi, I’d like mentorship!"
                })
            });

            console.log("RESPONSE:", res.status);

            if (res.ok) {
                const data = await res.json();

                //  update REAL state used by UI
                setRequests(prev => [...prev, data]);
            }

        } catch (err) {
            console.error(err);
        }
    };

    // Fetch posts on load
    useEffect(() => {
        fetch("http://localhost:5000/api/auth/me", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setCurrentUser(data));

        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/posts")
            if (res.ok) {
                const data = await res.json()
                setPosts(data)
            }
        } catch (err) {
            console.error("Failed to fetch posts:", err)
        } finally {
            setLoading(false)
        }
    }

    const handlePostSubmit = async () => {
        if (!newPostContent.trim() || !currentUser) return

        setSubmitting(true)
        try {
            const res = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    content: newPostContent
                })
            })

            if (res.ok) {
                const newPost = await res.json()
                setPosts([newPost, ...posts]) // Add new post to top
                setNewPostContent("")
            } else {
                alert("Failed to create post")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    // Helper to format date safely
    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true })
        } catch (e) {
            return "just now"
        }
    }
    console.log("USER:", currentUser)
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="font-serif text-3xl font-bold text-secondary">Community Feed</h1>
                <p className="text-muted-foreground mt-1">Connect and share with your network.</p>
            </div>

            {/* Create Post */}
            <Card className="mb-8 border shadow-sm">
                <CardContent className="p-4">
                    <Textarea
                        placeholder="What's on your mind?"
                        className="min-h-[100px] resize-none mb-3"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Posting as <span className="font-semibold">{currentUser?.name || "Guest"}</span>
                        </p>
                        <Button
                            onClick={handlePostSubmit}
                            disabled={submitting || !newPostContent.trim()}
                        >
                            {submitting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Alumni</h2>

                <div className="space-y-4">

                    {currentUser?.role === "student" &&
                        Array.isArray(alumni) &&
                        alumni.map((a) => {

                            const req = requests.find(r => r.alumni_id === a.id);

                            return (
                                <Card key={a.id} className="mb-4">
                                    <div className="flex justify-between items-center p-4">

                                        <div>
                                            <p className="font-semibold">{a.name}</p>
                                            <p className="text-sm text-muted-foreground">{a.email}</p>
                                        </div>

                                        {currentUser?.role === "student" && (
                                            <Button
                                                onClick={() => sendRequest(a.id)}
                                                disabled={!!req}
                                            >
                                                {req
                                                    ? req.status === "ACCEPTED"
                                                        ? "Connected"
                                                        : "Requested"
                                                    : "Request Mentorship"}
                                            </Button>
                                        )}

                                    </div>
                                </Card>
                            );
                        })}
                </div>
            </div>
            {/* Posts Feed */}
            <div className="space-y-6">
                {loading ? (
                    <p className="text-center text-muted-foreground">Loading posts...</p>
                ) : posts.length === 0 ? (
                    <p className="text-center text-muted-foreground">No posts yet. Be the first!</p>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 flex flex-row items-start gap-4 space-y-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {post.user_name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-secondary">{post.user_name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {post.user_role?.toLowerCase()} • {formatDate(post.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                        Like
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Comment
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div >

    )

}
