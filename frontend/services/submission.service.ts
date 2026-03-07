import api from "./api";

export interface MlAnalysis {
  summary: string;
  classification: string;
  techStack: string[];
  complexity: string;
  usabilityScore: number;
}

export interface SubmissionPayload {
  eventId: string;
  teamId: string;
  repoUrl: string;
  summary: string;
  demoUrl?: string;
}

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  repoUrl: string;
  demoUrl?: string;
  summary: string;
  status: "pending" | "submitted" | "evaluated";
  mlAnalysis?: MlAnalysis;
  score?: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  eventId?: string;
}

export interface CreateTeamPayload {
  name: string;
  members: string[];
}

export interface ParticipantStats {
  submissionsCount: number;
  averageScore?: number;
  lastSubmittedAt?: string;
}

export interface JudgeAssignmentWithSubmission {
  assignmentId: string;
  teamId: string;
  teamName: string;
  repoUrl: string;
  demoUrl?: string;
  summary: string;
  submissionId: string;
  mlAnalysis?: MlAnalysis;
  score?: number;
}

export async function createTeam(payload: CreateTeamPayload): Promise<Team> {
  const { data } = await api.post<Team>("/teams", payload);
  return data;
}

export async function registerTeamForEvent(
  eventId: string,
  teamId: string,
): Promise<void> {
  await api.post(`/events/${eventId}/register`, { teamId });
}

export async function submitProject(
  payload: SubmissionPayload,
): Promise<Submission> {
  const { data } = await api.post<Submission>("/submissions", payload);
  return data;
}

export async function getEventSubmissions(
  eventId: string,
): Promise<Submission[]> {
  const { data } = await api.get<Submission[]>(`/events/${eventId}/submissions`);
  return data || [];
}

export async function getParticipantSubmission(
  eventId: string,
): Promise<Submission | null> {
  const { data } = await api.get<Submission | null>(
    `/participant/events/${eventId}/submission`,
  );
  return data;
}

export async function getParticipantStats(
  eventId: string,
): Promise<ParticipantStats> {
  const { data } = await api.get<ParticipantStats>(
    `/participant/events/${eventId}/stats`,
  );
  return data;
}

export async function getJudgeAssignments(): Promise<
  JudgeAssignmentWithSubmission[]
> {
  const { data } = await api.get<JudgeAssignmentWithSubmission[]>(
    "/judge/assignments",
  );
  return data || [];
}

export async function submitScore(
  submissionId: string,
  score: number,
): Promise<Submission> {
  const { data } = await api.post<Submission>(
    `/submissions/${submissionId}/score`,
    { score },
  );
  return data;
}

export interface Certificate {
  id: string;
  teamName: string;
  eventTitle: string;
  fileName: string;
}

export async function getParticipantCertificates(): Promise<Certificate[]> {
  const { data } = await api.get<Certificate[]>("/participant/certificates");
  return data;
}

export async function downloadCertificate(
  certificateId: string,
): Promise<Blob> {
  const { data } = await api.get(`/participant/certificates/${certificateId}`, {
    responseType: "blob",
  });
  return data as Blob;
}

