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
  repoUrl: string | null;
  demoUrl: string | null;
  evaluated: boolean;
  score: number | null;
}

export interface EvaluationPayload {
  innovation: number;
  technicalComplexity: number;
  practicalImpact: number;
  presentation: number;
  feedback?: string;
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

  submitEvaluation: (submissionId: string, payload: EvaluationPayload) =>
    api.post(`/submissions/${submissionId}/evaluate`, payload).then(r => r.data),
};
