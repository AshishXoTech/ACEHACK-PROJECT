"use client"

import { useEffect, useState } from "react"
import api from "@/services/api"
import RegistrationTable from "@/components/registrations/RegistrationTable"

type Team = {
    id: string
    teamName: string
    members: string[]
    status: string
    track?: string
}

export default function RegistrationsPage() {
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRegistrations() {
            try {
                const res = await api.get("/organizer/registrations")
                setTeams(res.data)
            } catch (err) {
                console.error("Failed to fetch registrations:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchRegistrations()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] text-white p-10">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Team Registrations</h1>
                    <div className="text-center py-10">Loading registrations...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Team Registrations</h1>

                {teams.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No registrations found.
                    </div>
                ) : (
                    <RegistrationTable teams={teams} />
                )}
            </div>
        </div>
    )
}
