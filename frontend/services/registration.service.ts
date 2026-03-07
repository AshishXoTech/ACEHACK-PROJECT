import api from "./api"

export async function updateRegistration(id: string, status: string) {
  const res = await api.patch(`/organizer/registration/${id}`, {
    status,
  })

  return res.data
}