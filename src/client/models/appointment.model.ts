export interface Appointment {
  id: number;
  patientId: number;
  patientName?: string;
  providerName: string;
  department: string;
  appointmentDate: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Arrived' | 'In-Consultation' | 'Completed' | 'Cancelled';
  reason: string;
  room: string;
  createdAt: string;
}
