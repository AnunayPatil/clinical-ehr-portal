import { Injectable, AppInjector } from '../core/di-container.js';
import { HttpService } from './http.service.js';
import { BehaviorSubject, Observable } from '../core/event-bus.js';
import { Appointment } from '../models/appointment.model.js';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  private get http(): HttpService {
    return AppInjector.get(HttpService);
  }

  public get appointments$(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  public get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public async fetchAppointments(status = 'All'): Promise<Appointment[]> {
    this.loadingSubject.next(true);
    const params: Record<string, string> = {};
    if (status && status !== 'All') params.status = status;

    const res = await this.http.get<Appointment[]>('/appointments', params);
    this.loadingSubject.next(false);

    if (res.success && Array.isArray(res.data)) {
      this.appointmentsSubject.next(res.data);
      return res.data;
    }
    return [];
  }

  public async scheduleAppointment(data: Partial<Appointment>): Promise<{ success: boolean; data?: Appointment; error?: string }> {
    const res = await this.http.post<Appointment>('/appointments', data);
    if (res.success && res.data) {
      await this.fetchAppointments();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to schedule appointment' };
  }

  public async updateStatus(id: number, status: Appointment['status']): Promise<boolean> {
    const res = await this.http.patch<Appointment>(`/appointments/${id}/status`, { status });
    if (res.success) {
      const current = this.appointmentsSubject.value;
      const updated = current.map(a => (a.id === id ? { ...a, status } : a));
      this.appointmentsSubject.next(updated);
      return true;
    }
    return false;
  }
}
