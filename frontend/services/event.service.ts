import api from "./api";

export interface EventTrack {
  id?: string;
  name: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  tracks: string[];
  college?: string;
  theme?: string;
  publicUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  tracks: string[];
  college?: string;
  theme?: string;
  publicUrl?: string;
  rulesUrl?: string;
}

export interface TeamRegistration {
  id: string;
  teamName: string;
  members: string[];
  status: "pending" | "approved" | "rejected";
  track?: string;
}

export interface JudgeAssignment {
  id: string;
  teamId: string;
  teamName: string;
  judgeId: string;
  judgeName: string;
  evaluated: boolean;
}

export interface OrganizerAnalytics {
  totalTeams: number;
  totalSubmissions: number;
  pendingEvaluations: number;
  topTeams: {
    teamId: string;
    teamName: string;
    score: number;
  }[];
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const { data } = await api.post<Event>("/events", payload);
  return data;
}

export async function getEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events");
  return data || [];
}

export async function getEventById(eventId: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${eventId}`);
  return data;
}

export async function uploadEventRules(
  eventId: string,
  file: File,
): Promise<Event> {
  const formData = new FormData();
  formData.append("rules", file);

  const { data } = await api.post<Event>(
    `/events/${eventId}/rules`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
}

export async function updateEventPublicUrl(
  eventId: string,
  publicUrl: string,
): Promise<Event> {
  const { data } = await api.post<Event>(`/events/${eventId}/public-url`, {
    publicUrl,
  });
  return data;
}

export async function getEventRegistrations(
  eventId: string,
): Promise<TeamRegistration[]> {
  const { data } = await api.get<TeamRegistration[]>(
    `/events/${eventId}/registrations`,
  );
  return data || [];
}

export async function updateRegistrationStatus(
  eventId: string,
  teamId: string,
  status: "approved" | "rejected",
): Promise<TeamRegistration> {
  const { data } = await api.post<TeamRegistration>(
    `/events/${eventId}/registrations/${teamId}/status`,
    { status },
  );
  return data;
}

export async function sendCredentials(
  eventId: string,
  teamId: string,
): Promise<void> {
  await api.post(`/events/${eventId}/registrations/${teamId}/send-credentials`);
}

export async function assignJudgeToTeam(
  eventId: string,
  teamId: string,
  judgeId: string,
): Promise<JudgeAssignment> {
  const { data } = await api.post<JudgeAssignment>(
    `/events/${eventId}/assign-judge`,
    {
      teamId,
      judgeId,
    },
  );
  return data;
}

export async function getJudgeAssignmentsForEvent(
  eventId: string,
): Promise<JudgeAssignment[]> {
  const { data } = await api.get<JudgeAssignment[]>(
    `/events/${eventId}/judge-assignments`,
  );
  return data || [];
}

export async function getOrganizerAnalytics(
  eventId: string,
): Promise<OrganizerAnalytics> {
  const { data } = await api.get<OrganizerAnalytics>(
    `/events/${eventId}/analytics`,
  );
  return data;
}

export async function publishLeaderboard(eventId: string): Promise<void> {
  await api.post(`/events/${eventId}/leaderboard/publish`);
}

export async function generateCertificates(eventId: string): Promise<void> {
  await api.post(`/events/${eventId}/certificates/generate`);
}

