"use client"

import { useParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { getEventById } from "@/services/event.service"
import { createTeamAndRegister, getMyTeamForEvent } from "@/services/teams.service"
import { useRouter } from "next/navigation"

export default function EventDetails() {

    const params = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [team, setTeam] = useState<{ id: string; name: string } | null>(null)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [teamName, setTeamName] = useState("")
    const [memberEmails, setMemberEmails] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {


        async function fetchEvent() {
            try {
                const eventId = params.eventId as string
                const [data, existingTeam] = await Promise.all([
                    getEventById(eventId),
                    getMyTeamForEvent(eventId)
                ])
                setEvent(data)
                setTeam(existingTeam ? { id: existingTeam.id, name: existingTeam.name } : null)
            } catch (err) {
                console.error(err)
                setError("Could not load event details.")
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()


    }, [params.eventId])

    if (loading) {
        return <div className="p-10 text-white">Loading event...</div>
    }

    if (!event) {
        return <div className="p-10 text-red-500">Event not found</div>
    }

    async function handleCreateTeamAndRegister(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!teamName.trim()) {
            setError("Team name is required.")
            return
        }

        setSubmitting(true)
        setError("")
        try {
            const members = memberEmails
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean)

            await createTeamAndRegister({
                eventId: params.eventId as string,
                teamName: teamName.trim(),
                members,
            })

            router.push(`/events/${params.eventId}/workspace`)
        } catch (err: any) {
            setError(err?.response?.data?.message || "Could not create team and register.")
        } finally {
            setSubmitting(false)
        }
    }

    return (<div className="min-h-screen bg-[#020617] text-white p-10">


        <div className="max-w-4xl mx-auto">

            <h1 className="text-4xl font-bold mb-4">
                {event.title}
            </h1>

            <p className="text-gray-400 mb-6">
                {event.description}
            </p>

            <div className="mb-6">
                {team ? (
                    <button
                        onClick={() => router.push(`/events/${params.eventId}/workspace`)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Open Workspace
                    </button>
                ) : (
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Create Team & Register
                    </button>
                )}
                {team && (
                    <p className="text-xs text-gray-400 mt-2">
                        Registered Team: {team.name}
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm mb-6">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">

                <div className="bg-[#0f172a] p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <p>{event.location}</p>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Schedule</h3>
                    <p>
                        Start: {new Date(event.startDate).toLocaleString()}
                    </p>
                    <p>
                        End: {new Date(event.endDate).toLocaleString()}
                    </p>
                </div>

            </div>

            <div className="mt-8">

                <h2 className="text-2xl font-semibold mb-4">
                    Tracks
                </h2>

                <div className="flex flex-wrap gap-3">

                    {event.tracks.map((track: string) => (
                        <span
                            key={track}
                            className="bg-blue-600 px-4 py-2 rounded-lg text-sm"
                        >
                            {track}
                        </span>
                    ))}

                </div>

            </div>

        </div>

        {showRegisterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                <form
                    onSubmit={handleCreateTeamAndRegister}
                    className="w-full max-w-md rounded-xl border border-slate-800 bg-[#0f172a] p-5 space-y-4"
                >
                    <h3 className="text-lg font-semibold">Create Team & Register</h3>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-300" htmlFor="teamName">
                            Team Name
                        </label>
                        <input
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                            placeholder="Enter team name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-300" htmlFor="memberEmails">
                            Team Members (emails)
                        </label>
                        <textarea
                            id="memberEmails"
                            value={memberEmails}
                            onChange={(e) => setMemberEmails(e.target.value)}
                            className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500/50 focus:ring"
                            placeholder="alice@example.com, bob@example.com"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowRegisterModal(false)}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                            {submitting ? "Creating..." : "Create Team & Register"}
                        </button>
                    </div>
                </form>
            </div>
        )}

    </div>


    )
}

