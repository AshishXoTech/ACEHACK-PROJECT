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
  projectName?: string;
  eventId: string;
  eventName: string;
  repo?: string | null;
  submissionId: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  demoVideo?: string | null;
  description?: string;
  readme?: string;
  summary: string;
  readmeSummary?: string;
  category?: string;
  techStack?: string[];
  commitStats?: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
  evaluated: boolean;
  score: number | null;
}

export interface JudgeSubmissionDetails {
  teamId: string;
  teamName: string;
  projectName?: string;
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  repositoryLink: string;
  description?: string;
  readmePreview: string;
  submissionDescription?: string;
  demoVideo: string;
  category?: string;
  techStack?: string[];
  commitStats?: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
  submissionId: string;
}

export interface SubmissionAnalysisResult {
  submissionId?: string;
  teamId?: string;
  summary?: string;
  category?: string;
  tech_stack?: string[];
  techStack?: string[];
  complexity?: string;
  innovation_score?: number | null;
  commit_frequency?: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
  commitStats?: {
    total: number;
    last7Days: number;
    last30Days: number;
  };
}

export interface RepoAnalysisResponse {
  teamId: string;
  projectSummary: string;
  projectCategory: string;
  techStack: string[];
  commitInsights: {
    totalCommits: number;
    topContributor: string;
    developmentPattern: string;
    majorFocus: string;
  };
  commitFrequency?: {
    last7Days: number;
    last30Days: number;
  };
  generatedAt: string | null;
  cached: boolean;
}

export interface EvaluationPayload {
  innovation: number;
  technical: number;
  impact: number;
  presentation: number;
  comments?: string;
}

export const judgeService = {
  getAssignments: (eventId: string) =>
    api.get<{ assignments: JudgeAssignment[]; judges: Judge[] }>(
      `/judge/assignments/${eventId}`
    ).then(r => r.data),

  assignJudge: (eventId: string, teamId: string, judgeId: string) =>
    api.post(`/judge/assign`, { eventId, teamId, judgeId }).then(r => r.data),

  getAssignedTeams: () =>
    api.get<{ teams: AssignedTeam[] }>("/judge/assigned-teams").then(r => r.data),

  getSubmissionByTeam: (teamId: string) =>
    api.get<JudgeSubmissionDetails>(`/judge/submission/${teamId}`).then(r => r.data),

  getRepoAnalysis: (teamId: string) =>
    api.get<RepoAnalysisResponse>(`/ai/repo-analysis/${teamId}`).then(r => r.data),

  runSubmissionAnalysis: (teamId: string, submissionId?: string) =>
    api.post<SubmissionAnalysisResult>("/submissions/analyze", {
      teamId,
      submissionId,
    }).then((r) => r.data),

  submitEvaluation: (teamId: string, payload: EvaluationPayload) =>
    api.post(`/judge/score`, {
      teamId,
      innovation: payload.innovation,
      technical: payload.technical,
      impact: payload.impact,
      presentation: payload.presentation,
      comments: payload.comments,
    }).then(r => r.data),

  getLeaderboard: () =>
    api.get<{ rank: number; teamName: string; totalScore: number }[]>("/judge/leaderboard")
      .then((r) => r.data || []),
};
