"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Briefcase, GraduationCap, Mail, Edit2, Save, X } from "lucide-react"

interface ProfileData {
  name: string
  email: string
  company: string | null
  job_title: string | null
  graduation_year: number | null
  bio: string | null
}

export default function AlumniProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    company: "",
    job_title: "",
    graduation_year: "",
    bio: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return

    const user = JSON.parse(storedUser)

    try {
      const res = await fetch(`http://localhost:5000/api/alumni/profile/${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setProfile({
          ...data,
          name: data.name || user.name || "Alumni",
          email: data.email || user.email || ""
        })
        setFormData({
          company: data.company || "",
          job_title: data.job_title || "",
          graduation_year: data.graduation_year?.toString() || "",
          bio: data.bio || ""
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return
    const user = JSON.parse(storedUser)

    try {
      const res = await fetch("http://localhost:5000/api/alumni/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          ...formData,
          graduation_year: Number(formData.graduation_year)
        })
      })

      if (res.ok) {
        fetchProfile() // Refresh data
        setIsEditing(false)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save profile")
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>

  if (!profile) return <div className="p-8">User not found</div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Top Profile Header */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
            <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">
              {profile.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-serif font-bold text-secondary">{profile.name}</h1>
              <Badge variant="secondary" className="px-3 py-1">Alumni</Badge>
            </div>

            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4" /> {profile.email}
            </p>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Professional Details */}
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Professional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Company</label>
                  <Input
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Where do you work?"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Job Title</label>
                  <Input
                    value={formData.job_title}
                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="What is your role?"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Graduation Year</label>
                  <Input
                    type="number"
                    value={formData.graduation_year}
                    onChange={e => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="YYYY"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Role</p>
                  <p className="font-medium text-secondary">
                    {profile.job_title || "Not added"}
                    {profile.company && <span className="text-muted-foreground font-normal"> at {profile.company}</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> Graduation Year
                  </p>
                  <p className="font-medium text-secondary">
                    {profile.graduation_year || "Unknown"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: About / Bio */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">About Me</CardTitle>
            <CardDescription>Share your professional journey and mentorship goals.</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  className="min-h-[150px]"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell students about your experience..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-stone max-w-none">
                {profile.bio ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <p className="text-muted-foreground italic">No bio added yet.</p>
                    <Button variant="link" onClick={() => setIsEditing(true)}>Add a bio</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
