import api from "./api";

export interface ParticipantDashboardData {
    user?: {
        id: string;
        name: string;
        email: string;
    };
    registrations: {
        eventId: string;
        eventName: string;
        teamId: string;
        teamName: string;
        members?: string[];
        status: "approved" | "pending" | "rejected" | string;
        submissionId?: string;
    }[];
    hasCertificates: string[];
}

export async function getParticipantDashboardData(): Promise<ParticipantDashboardData> {
    const { data } = await api.get<ParticipantDashboardData>("/participant/dashboard");
    return data;
}
