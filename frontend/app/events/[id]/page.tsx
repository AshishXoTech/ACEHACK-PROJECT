"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getEventById } from "@/services/event.service"

export default function EventDetails() {

    const params = useParams()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {


        async function fetchEvent() {
            try {
                const data = await getEventById(params.id as string)
                setEvent(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()


    }, [params.id])

    if (loading) {
        return <div className="p-10 text-white">Loading event...</div>
    }

    if (!event) {
        return <div className="p-10 text-red-500">Event not found</div>
    }

    return (<div className="min-h-screen bg-[#020617] text-white p-10">


        <div className="max-w-4xl mx-auto">

            <h1 className="text-4xl font-bold mb-4">
                {event.title}
            </h1>

            <p className="text-gray-400 mb-6">
                {event.description}
            </p>

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

    </div>


    )
}
