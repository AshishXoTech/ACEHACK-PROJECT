"use client"

import { useState } from "react"
import api from "@/services/api"

export default function CreateEventForm() {

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    tracks: ""
  })

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: any) => {

    e.preventDefault()

    try {

      await api.post("/events", {
        ...form,
        tracks: form.tracks.split(",").map((t) => t.trim())
      })

      alert("Event created successfully")

    } catch (err) {

      console.error(err)
      alert("Failed to create event")

    }

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      <input
        name="title"
        placeholder="Event Title"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Event Description"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <input
        name="location"
        placeholder="Location"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <input
        type="datetime-local"
        name="startDate"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <input
        type="datetime-local"
        name="endDate"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <input
        name="tracks"
        placeholder="Tracks (comma separated)"
        className="w-full p-3 bg-[#0f172a] rounded"
        onChange={handleChange}
      />

      <button
        type="submit"
        className="bg-blue-600 px-6 py-3 rounded font-semibold"
      >
        Create Event
      </button>

    </form>

  )

}