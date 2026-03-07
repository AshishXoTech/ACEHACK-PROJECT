import api from "./api";

export interface Sponsor {
  id: string;
  companyName: string;
  logoUrl: string;
  industry: string;
  website: string;
  about: string;
  sponsorshipType: string;
  sponsorshipCriteria: string;
  technologies: string[];
  contactEmail: string;
  cashPrizeContribution: string;
  apiCredits: string;
  cloudCredits: string;
  mentorshipSupport: boolean;
  judgingParticipation: boolean;
  workshopsOrTechTalks: boolean;
  swagOrMerchandise: boolean;
  pastHackathons: string[];
  linkedinPage: string;
}

export interface SponsorRegistrationPayload {
  companyName: string;
  logoUrl: string;
  industry: string;
  website: string;
  about: string;
  sponsorshipType: string;
  sponsorshipCriteria: string;
  technologies: string[];
  contactEmail: string;
  cashPrizeContribution: string;
  apiCredits: string;
  cloudCredits: string;
  mentorshipSupport: boolean;
  judgingParticipation: boolean;
  workshopsOrTechTalks: boolean;
  swagOrMerchandise: boolean;
  pastHackathons: string[];
  linkedinPage: string;
}

export async function getSponsors(): Promise<Sponsor[]> {
  const { data } = await api.get<{ sponsors: Sponsor[] }>("/sponsors");
  return data.sponsors || [];
}

export async function getSponsorById(sponsorId: string): Promise<Sponsor> {
  const { data } = await api.get<Sponsor>(`/sponsors/${sponsorId}`);
  return data;
}

export async function registerSponsor(payload: SponsorRegistrationPayload): Promise<Sponsor> {
  const { data } = await api.post<{ sponsor: Sponsor }>("/sponsors/register", payload);
  return data.sponsor;
}
