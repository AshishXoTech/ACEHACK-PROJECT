import api from "./api";

export const certificateService = {
  generate: (eventId: string) =>
    api.post<{ generated: number; message: string }>(
      `/events/${eventId}/certificates/generate`
    ).then(r => r.data),

  download: (eventId: string, teamId: string) =>
    api.get(`/events/${eventId}/certificates/${teamId}`, { responseType: "blob" })
      .then(r => r.data),
};
