import api from "./api";

export interface JudgeAssignment {
  teamId: string;
  teamName: string;
  judgeId: string | null;
  judgeName: string | null;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
}

export interface AssignedTeam {
  teamId: string;
  teamName: string;
  eventId: string;
  eventName: string;
  submissionId: string | null;
  repoUrl: string;
  readmeSummary: string;
  members: string[];
  evaluated: boolean;
  score: number | null;
}

export interface EvaluationPayload {
  teamId: string;
  innovation: number;
  technical: number;
  impact: number;
  presentation: number;
  comments?: string;
}

export interface JudgeSubmissionDetail {
  teamId: string;
  teamName: string;
  eventId: string;
  eventName: string;
  members: { id: string; name: string; email: string }[];
  submissionId: string;
  repo: string;
  demo: string;
  readme: string;
  description: string;
  status: string;
}

export interface AIAnalysisPayload {
  repoUrl: string;
  readme: string;
  packageJson?: string;
  requirements?: string;
}

export interface AIAnalysisResult {
  summary: string;
  category: string;
  techStack: string[];
  commitFrequency: string;
}

export const judgeService = {
  getAssignments: (eventId: string) =>
    api.get<{ assignments: JudgeAssignment[]; judges: Judge[] }>(
      `/events/${eventId}/judge-assignments`
    ).then(r => r.data),

  assignJudge: (eventId: string, teamId: string, judgeId: string) =>
    api.post(`/events/${eventId}/assign-judge`, { teamId, judgeId }).then(r => r.data),

  getAssignedTeams: () =>
    api.get<{ teams: AssignedTeam[] }>("/judge/assigned-teams").then(r => r.data),

  getSubmissionByTeam: (teamId: string) =>
    api.get<JudgeSubmissionDetail>(`/judge/submission/${teamId}`).then((r) => r.data),

  submitScore: (payload: EvaluationPayload) =>
    api.post("/judge/score", payload).then((r) => r.data),

  analyzeProject: (payload: AIAnalysisPayload) =>
    api.post<AIAnalysisResult>("/ai/analyze-project", payload).then((r) => r.data),

  // Backward compatibility for older evaluate route.
  submitEvaluation: (submissionId: string, payload: Omit<EvaluationPayload, "teamId">) =>
    api.post(`/submissions/${submissionId}/evaluate`, payload).then(r => r.data),
};
