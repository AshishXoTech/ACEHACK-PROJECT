import api from "./api";

export interface MyHackathonEvent {
  eventId: string;
  eventName: string;
  banner: string;
  status: "approved" | "pending" | "rejected" | string;
  teamName: string;
}

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

export interface EventResources {
  discord: string;
  rulebook: string;
  datasets: string[];
  apiKeys: string[];
  mentorSchedule: string;
}

export interface WorkspaceSubmissionPayload {
  eventId: string;
  projectName: string;
  repo: string;
  demo?: string;
  description: string;
}

export interface CreateWorkspaceTeamPayload {
  eventId: string;
  name: string;
  members: string[];
}

export async function getMyHackathons(): Promise<MyHackathonEvent[]> {
  const { data } = await api.get<{ events: MyHackathonEvent[] }>("/participant/events");
  return data.events || [];
}

export async function getTeamByEvent(eventId: string): Promise<EventTeam | null> {
  const { data } = await api.get<EventTeam | null>(`/teams/${eventId}`);
  return data;
}

export async function leaveTeam(eventId: string): Promise<void> {
  await api.delete(`/teams/${eventId}/leave`);
}

export async function createWorkspaceTeam(payload: CreateWorkspaceTeamPayload): Promise<void> {
  await api.post("/teams", payload);
}

export async function submitWorkspaceProject(payload: WorkspaceSubmissionPayload): Promise<void> {
  await api.post("/submissions", {
    eventId: payload.eventId,
    projectName: payload.projectName,
    repoUrl: payload.repo,
    demoUrl: payload.demo,
    description: payload.description,
    repo: payload.repo,
    demo: payload.demo,
  });
}

export async function getEventResources(eventId: string): Promise<EventResources> {
  const { data } = await api.get<EventResources>(`/events/${eventId}/resources`);
  return data;
}
