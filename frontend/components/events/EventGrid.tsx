import EventCard from "./EventCard"

export default function EventGrid({ events }: any) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {events.map((event: any) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}