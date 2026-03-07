import api from "./api"

export async function createEvent(data: any) {
  const res = await api.post("/organizer/events", data)
  return res.data
}