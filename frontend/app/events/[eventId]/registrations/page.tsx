"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import api from "@/services/api"
import RegistrationTable from "@/components/registrations/RegistrationTable"

export default function RegistrationsPage() {

  const params = useParams()

  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchRegistrations() {

      try {

        const res = await api.get(
          `/events/${params.eventId}/registrations`
        )

        setTeams(res.data)

      } catch (err) {

        console.error(err)

      } finally {

        setLoading(false)

      }

    }

    if (params?.eventId) {
      fetchRegistrations()
    }

  }, [params])

  if (loading) {
    return <div className="p-10 text-white">Loading registrations...</div>
  }

  return (

    <div className="min-h-screen bg-[#020617] text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Team Registrations
        </h1>

        <RegistrationTable
          teams={teams}
        />

      </div>

    </div>

  )

}
