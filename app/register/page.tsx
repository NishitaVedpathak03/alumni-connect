"use client"

import { useState } from "react"

export default function RegisterPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("STUDENT")

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, role })
        })

        const data = await res.json()
        alert(data.message || "Done")
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleRegister} className="space-y-4 w-80">
                <input
                    className="border p-2 w-full"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="border p-2 w-full"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <select
                    className="border p-2 w-full"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="STUDENT">Student</option>
                    <option value="ALUMNI">Alumni</option>
                </select>

                <button className="bg-black text-white p-2 w-full">
                    Register
                </button>
            </form>
        </div>
    )
}
