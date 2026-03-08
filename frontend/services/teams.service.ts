import api from "./api";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
}

export interface EventTeam {
  id: string;
  name: string;
  eventId: string;
  leader: TeamMember | null;
  members: TeamMember[];
}

export interface CreateTeamPayload {
  eventId: string;
  teamName: string;
  members: string[];
}

export async function getMyTeamForEvent(eventId: string): Promise<EventTeam | null> {
  const { data } = await api.get<EventTeam | null>(`/teams/${eventId}`);
  return data;
}

export async function createTeamAndRegister(payload: CreateTeamPayload): Promise<EventTeam> {
  try {
    const { data } = await api.post<EventTeam>("/teams/create", payload);
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 404) {
      throw error;
    }
  }

  const { data } = await api.post<EventTeam>("/teams", {
    eventId: payload.eventId,
    name: payload.teamName,
    members: payload.members,
  });
  return data;
}
