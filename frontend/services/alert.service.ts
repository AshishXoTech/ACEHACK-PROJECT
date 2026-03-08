import api from "./api";

export interface AlertRecord {
  id: string;
  eventId: string;
  title: string;
  message: string;
  createdBy: string;
  createdByName?: string;
  scheduledAt: string;
  isInstant: boolean;
  delivered: boolean;
  createdAt: string;
}

export interface CreateAlertPayload {
  eventId: string;
  title: string;
  message: string;
  isInstant: boolean;
  scheduledAt?: string;
}

export const alertService = {
  create: (payload: CreateAlertPayload) =>
    api.post<AlertRecord>("/alerts/create", payload).then((r) => r.data),

  getByEvent: (eventId: string) =>
    api.get<AlertRecord[]>(`/alerts/event/${eventId}`).then((r) => r.data || []),

  process: () =>
    api.post<{ processed: number }>("/alerts/process").then((r) => r.data),
};
