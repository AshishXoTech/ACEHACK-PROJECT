"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/services/api"
import AnalyticsCard from "@/components/analytics/AnalyticsCard"
import TopTeams from "@/components/analytics/TopTeams"

export default function AnalyticsPage() {

  const params = useParams()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchAnalytics() {

      try {

        const res = await api.get(
          `/events/${params.eventId}/analytics`
        )

        setData(res.data)

      } catch (err) {

        console.error(err)

      } finally {

        setLoading(false)

      }

    }

    if (params?.eventId) {
      fetchAnalytics()
    }

  }, [params])

  if (loading) {
    return <div className="p-10 text-white">Loading analytics...</div>
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Event Analytics
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <AnalyticsCard
            title="Total Teams"
            value={data.totalTeams}
          />

          <AnalyticsCard
            title="Total Submissions"
            value={data.totalSubmissions}
          />

          <AnalyticsCard
            title="Pending Evaluations"
            value={data.pendingEvaluations}
          />

        </div>

        <TopTeams teams={data.topTeams} />

      </div>

    </div>

  )

}
