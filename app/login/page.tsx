"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<"student" | "alumni">("student")


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"   // 🔥 ADD THIS
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Login failed")
        return
      }

      // ✅ Store everything
      localStorage.setItem("role", data.user.role)
      localStorage.setItem("user", JSON.stringify(data.user))

      // 🚨 Role mismatch check
      if (data.user.role.toLowerCase() !== selectedRole.toLowerCase()) {
        alert("Selected role does not match your account.")
        return
      }

      // ✅ Redirect correctly
      if (selectedRole === "student") {
        router.push("/student/dashboard")   // since student system lives here
      } else {
        router.push("/alumni/dashboard")     // real alumni system
      }



    } catch (err) {
      console.error(err)
      alert("Server error")
    }
  }


  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="University Logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <h1 className="font-serif text-3xl font-bold text-secondary">AlumniConnect</h1>
          <p className="text-muted-foreground mt-2 text-center">
            Connect with your university community
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Role Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition ${selectedRole === "student"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                    }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("alumni")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition ${selectedRole === "alumni"
                    ? "bg-background shadow"
                    : "text-muted-foreground"
                    }`}
                >
                  Alumni
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-email">University Email</Label>
                <Input
                  id="student-email"
                  type="email"
                  placeholder="student@university.edu"
                  className="h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-password">Password</Label>
                <div className="relative">
                  <Input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-11 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 font-medium">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
