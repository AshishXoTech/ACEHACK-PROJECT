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

export interface ParticipantDashboardResponse {
    user?: {
        id: string;
        name: string;
        email: string;
    };
    approvedEvents: number;
    submissions: number;
    certificates: number;
    registeredEvents: {
        eventId: string;
        eventName: string;
        status: string;
        teamId: string;
        teamName: string;
        members: string[];
        submissionId?: string | null;
    }[];
    teamMembers: {
        eventId: string;
        eventName: string;
        teamId: string;
        teamName: string;
        members: string[];
    }[];
    leaderboardPosition: number | null;
    hasCertificates: string[];
}

export async function getParticipantDashboardData(): Promise<ParticipantDashboardData> {
    const { data } = await api.get<ParticipantDashboardData>("/participant/dashboard");
    return data;
}

export async function getParticipantDashboard(): Promise<ParticipantDashboardResponse> {
    try {
        const { data } = await api.get<ParticipantDashboardResponse>("/participant/me");
        return {
            approvedEvents: data.approvedEvents ?? 0,
            submissions: data.submissions ?? 0,
            certificates: data.certificates ?? 0,
            registeredEvents: data.registeredEvents ?? [],
            teamMembers: data.teamMembers ?? [],
            leaderboardPosition:
                typeof data.leaderboardPosition === "number" ? data.leaderboardPosition : null,
            hasCertificates: data.hasCertificates ?? [],
            user: data.user,
        };
    } catch {
        const base = await getParticipantDashboardData();

        const teamFetches = (base.registrations || []).map(async (registration) => {
            try {
                const { data } = await api.get<{ members?: { name?: string }[] } | null>(
                    `/teams/${registration.eventId}`,
                );
                const memberNames = (data?.members || [])
                    .map((member) => member?.name || "")
                    .filter(Boolean);
                return [registration.eventId, memberNames] as const;
            } catch {
                return [registration.eventId, registration.members || []] as const;
            }
        });

        const teamMemberMap = Object.fromEntries(await Promise.all(teamFetches));

        const registeredEvents = (base.registrations || []).map((registration) => ({
            eventId: registration.eventId,
            eventName: registration.eventName,
            status: registration.status,
            teamId: registration.teamId,
            teamName: registration.teamName,
            members: teamMemberMap[registration.eventId] || registration.members || [],
            submissionId: registration.submissionId ?? null,
        }));

        return {
            user: base.user,
            approvedEvents: registeredEvents.filter((event) => event.status === "approved").length,
            submissions: registeredEvents.filter((event) => Boolean(event.submissionId)).length,
            certificates: (base.hasCertificates || []).length,
            registeredEvents,
            teamMembers: registeredEvents.map((event) => ({
                eventId: event.eventId,
                eventName: event.eventName,
                teamId: event.teamId,
                teamName: event.teamName,
                members: event.members,
            })),
            leaderboardPosition: null,
            hasCertificates: base.hasCertificates || [],
        };
    }
}
