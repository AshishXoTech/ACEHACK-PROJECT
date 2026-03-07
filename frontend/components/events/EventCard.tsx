type Event = {
  id: string
  name: string
  location: string
  startDate: string
  tracks: string[]
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="border rounded-xl p-5 shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{event.name}</h2>

      <p className="text-gray-500">{event.location}</p>

      <p className="text-sm mt-2">
        Start Date: {event.startDate}
      </p>

      <div className="flex gap-2 mt-3 flex-wrap">
        {event.tracks.map((track) => (
          <span
            key={track}
            className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded"
          >
            {track}
          </span>
        ))}
      </div>

      <a
        href={`/events/${event.id}`}
        className="mt-4 inline-block text-blue-600 font-semibold"
      >
        View Details →
      </a>
    </div>
  )
}