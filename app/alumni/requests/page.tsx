"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Request {
    id: number
    student_name: string
    student_email: string
    message: string
    status: "PENDING" | "ACCEPTED" | "REJECTED"
    created_at: string
}


export default function MentorshipRequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [user, setUser] = useState<any>(null)
    useEffect(() => {
        fetch("http://localhost:5000/api/auth/me", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setUser(data));
    }, []);
    const [loading, setLoading] = useState(true)
    // const { toast } = useToast() // Optional integration with toast

    // Fetch requests on load
    useEffect(() => {
        if (user) {
            fetchRequests()
        }
    }, [user])

    const fetchRequests = async () => {
        if (!user) return;
        try {
            const res = await fetch(`http://localhost:5000/api/mentorship/alumni/${user.id}`)
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (err) {
            console.error("Failed to fetch requests", err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: number, status: "ACCEPTED" | "REJECTED") => {
        // Optimistic update
        setRequests(requests.map(req =>
            req.id === id ? { ...req, status } : req
        ))

        try {
            const res = await fetch(`http://localhost:5000/api/mentorship/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            })

            if (!res.ok) {
                throw new Error("Failed to update")
            }

            // confirm update/refresh
            fetchRequests()

        } catch (err) {
            console.error(err)
            alert("Failed to update status")
            fetchRequests() // revert
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-3xl font-bold text-secondary">
                    Mentorship Requests
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage incoming mentorship applications from students.
                </p>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/10">
                            <TableHead className="w-[200px]">Student</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead className="w-[150px]">Date</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium text-secondary">{req.student_name}</div>
                                        <div className="text-xs text-muted-foreground">{req.student_email}</div>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate" title={req.message}>
                                        {req.message}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={req.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "PENDING" && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() => handleStatusUpdate(req.id, "ACCEPTED")}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        ACCEPTED: "bg-green-100 text-green-700 border-green-200",
        REJECTED: "bg-red-100 text-red-700 border-red-200",
    }

    return (
        <Badge variant="outline" className={`border ${styles[status as keyof typeof styles] || ""}`}>
            {status}
        </Badge>
    )
}
