"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/services/api"
import SubmissionCard from "./SubmissionCard"

export default function SubmissionsPage() {

  const params = useParams()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchSubmissions() {

      try {

        const res = await api.get(
          `/events/${params.id}/submissions`
        )

        setSubmissions(res.data)

      } catch (err) {

        console.error(err)

      } finally {

        setLoading(false)

      }

    }

    if (params?.id) {
      fetchSubmissions()
    }

  }, [params])

  if (loading) {
    return <div className="p-10 text-white">Loading submissions...</div>
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Event Submissions
        </h1>

        {submissions.length === 0 && (
          <p className="text-gray-400">
            No submissions yet.
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
            />
          ))}

        </div>

      </div>

    </div>

  )

}