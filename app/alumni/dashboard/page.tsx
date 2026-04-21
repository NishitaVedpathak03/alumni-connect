"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Check, X, Clock, Users, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
type Request = {
    id: number;
    student_id: string;
    alumni_id: string;
    message: string;
    status: string;
    student_name: string;      // ✅ ADD
    student_email: string;     // ✅ ADD
};
export default function AlumniDashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const [requests, setRequests] = useState<Request[]>([]);
    useEffect(() => {
        if (!user) return;

        fetch(`http://localhost:5000/api/mentorship/alumni/${user.id}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setRequests(Array.isArray(data) ? data : []));
    }, [user]);

    useEffect(() => {
        fetch("http://localhost:5000/api/auth/me", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setUser(data));

        fetch("http://localhost:5000/api/mentorship", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(err => console.error(err));
    }, []);
    const myRequests = requests;
    const total = myRequests.length;
    const pending = myRequests.filter(r => r.status === "PENDING").length;
    const accepted = myRequests.filter(r => r.status === "ACCEPTED").length;
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div>
                <h1 className="font-serif text-3xl font-bold text-secondary">
                    Welcome back, {user?.name || "User"}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Here's an overview of your mentorship activities.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <SummaryCard
                    title="Total Mentorship Requests"
                    value={String(total)}
                    icon={Users}
                />
                <SummaryCard
                    title="Pending Requests"
                    value={String(pending)}
                    icon={Clock}
                    highlight
                />
                <SummaryCard
                    title="Active Mentorships"
                    value={String(accepted)}
                    icon={BookOpen}
                />
            </div>

            {/* Recent Requests Table */}
            <Card className="border shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                    <CardTitle className="text-lg font-semibold text-secondary">
                        Recent Requests
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                <TableHead className="w-[200px] font-medium text-muted-foreground">Student Name</TableHead>
                                <TableHead className="font-medium text-muted-foreground">Message Preview</TableHead>
                                <TableHead className="w-[150px] font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="w-[150px] text-right font-medium text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myRequests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-muted/5">
                                    <TableCell className="font-medium text-secondary">
                                        {req.student_name}
                                        <p className="text-sm text-muted-foreground">
                                            {req.student_email}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[300px]">
                                        {req.message}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={req.status.toUpperCase()} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* ✅ Pending → Show Accept/Reject */}
                                        {req.status.toLowerCase() === "pending" && (
                                            <div className="flex items-center justify-end gap-2">
                                                console.log("REQ DATA:", req)
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-destructive"
                                                    title="Reject"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={async () => {
                                                        await fetch(`http://localhost:5000/api/mentorship/${req.id}`, {
                                                            method: "PATCH",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ status: "ACCEPTED" })
                                                        });

                                                        setRequests(prev =>
                                                            prev.map(r =>
                                                                r.id === req.id ? { ...r, status: "ACCEPTED" } : r
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* ✅ Accepted → Show Open Chat */}
                                        {req.status === "ACCEPTED" && (
                                            <Button
                                                size="sm"
                                                onClick={() => router.replace(`/alumni/chat/${req.student_id}`)}
                                            >
                                                Open Chat
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function SummaryCard({ title, value, icon: Icon, highlight }: { title: string, value: string, icon: any, highlight?: boolean }) {
    return (
        <Card className={cn("border shadow-sm transition-all hover:shadow-md", highlight && "border-primary/50 bg-primary/5")}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-secondary mt-2">{value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    let styles = ""
    if (status === "PENDING") styles = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200"
    if (status === "ACCEPTED") styles = "bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200"
    if (status === "REJECTED") styles = "bg-red-100 text-red-700 hover:bg-red-100/80 border-red-200"

    return (
        <Badge variant="outline" className={cn("font-medium border px-2.5 py-0.5", styles)}>
            {status}
        </Badge>
    )
}

import { cn } from "@/lib/utils"
