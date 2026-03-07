"use client"

import api from "@/services/api"
import { useState } from "react"

type Team = {
    id: string
    teamName: string
    members: string[]
    status: string
    track?: string
    eventName?: string
    eventId?: string
}

export default function RegistrationTable({
    teams
}: {
    teams: Team[]
}) {

    const [teamList, setTeamList] = useState<Team[]>(teams)

    const updateStatus = async (teamId: string, status: "approved" | "rejected") => {

        // Find the team to get its eventId
        const team = teamList.find(t => t.id === teamId);
        if (!team?.eventId) {
            alert("Event ID not found for this team");
            return;
        }

        try {

            const res = await api.post(
                `/events/${team.eventId}/registrations/${teamId}/status`,
                {
                    status: status
                }
            )

            console.log("Server response:", res.data)

            setTeamList((prev) =>
                prev.map((team) =>
                    team.id === teamId
                        ? { ...team, status }
                        : team
                )
            )

        } catch (error: any) {

            console.error("API ERROR:", error.response?.data || error.message)

            alert(
                error.response?.data?.message ||
                "Failed to update registration status"
            )

        }

    }

    return (

        <div className="bg-[#0f172a] rounded-xl p-6">

            <table className="w-full">

                <thead>

                    <tr className="text-left text-gray-400 border-b border-slate-700">

                        <th className="pb-3">Team</th>
                        <th className="pb-3">Members</th>
                        <th className="pb-3">Event</th>
                        <th className="pb-3">Track</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>

                    </tr>

                </thead>

                <tbody>

                    {teamList.map((team) => (

                        <tr
                            key={team.id}
                            className="border-b border-slate-800"
                        >

                            <td className="py-3">{team.teamName}</td>

                            <td className="py-3">
                                {team.members.join(", ")}
                            </td>

                            <td className="py-3">
                                {team.eventName || "-"}
                            </td>

                            <td className="py-3">
                                {team.track || "-"}
                            </td>

                            <td className="py-3 capitalize">
                                {team.status}
                            </td>

                            <td className="py-3 flex gap-2">

                                {team.status !== "approved" && (
                                    <button
                                        onClick={() => updateStatus(team.id, "approved")}
                                        className="bg-green-600 px-3 py-1 rounded hover:bg-green-500"
                                    >
                                        Approve
                                    </button>
                                )}

                                {team.status !== "rejected" && (
                                    <button
                                        onClick={() => updateStatus(team.id, "rejected")}
                                        className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                                    >
                                        Reject
                                    </button>
                                )}

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}