import api from "./api";

export interface Sponsor {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  technologies: string[];
  sponsorshipType: string;
  sponsorshipCriteria: string;
  contactEmail: string;
}

export interface SponsorRegistrationPayload {
  companyName: string;
  industry: string;
  website: string;
  technologies: string[];
  sponsorshipType: string;
  sponsorshipCriteria: string;
  contactEmail: string;
}

export async function getSponsors(): Promise<Sponsor[]> {
  const { data } = await api.get<Sponsor[]>("/sponsors");
  return data || [];
}

export async function registerSponsor(
  payload: SponsorRegistrationPayload,
): Promise<Sponsor> {
  const { data } = await api.post<Sponsor>("/sponsors/register", payload);
  return data;
}
