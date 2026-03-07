"use client"

import { useEffect, useState } from "react"
import EventGrid from "@/components/events/EventGrid"
import { getEvents } from "@/services/event.service"
import type { Event } from "@/services/event.service"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    async function fetchEvents() {
      const data = await getEvents()
      setEvents(data)
    }

    fetchEvents()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Explore Hackathons
      </h1>

      <EventGrid events={events} />
    </div>
  )
}