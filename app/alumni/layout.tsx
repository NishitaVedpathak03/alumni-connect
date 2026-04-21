"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    UserCircle,
    MessageSquare,
    BookOpen,
    LogOut,
    Users
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AlumniLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-muted/30 hidden md:flex flex-col">
                {/* App Logo/Name */}
                <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <h1 className="font-serif text-2xl font-bold text-secondary tracking-tight">
                        AlumniConnect
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    <NavLink
                        href="/alumni/dashboard"
                        icon={LayoutDashboard}
                        label="Dashboard"
                    />
                    <NavLink
                        href="/alumni/profile"
                        icon={UserCircle}
                        label="Profile"
                    />
                    <NavLink
                        href="/alumni/requests"
                        icon={MessageSquare}
                        label="Mentorship Requests"
                    />
                    <NavLink
                        href="/alumni/active"
                        icon={BookOpen}
                        label="Active Mentorships"
                    />
                    <NavLink
                        href="/alumni/community"
                        icon={Users}
                        label="Community"
                    />
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-border/50">
                    <Link href="/login">
                        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen bg-background">
                <div className="container mx-auto p-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    const pathname = usePathname()
    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
            {label}
        </Link>
    )
}
