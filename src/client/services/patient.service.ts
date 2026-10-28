import { Injectable, AppInjector } from '../core/di-container.js';
import { HttpService } from './http.service.js';
import { BehaviorSubject, Observable } from '../core/event-bus.js';
import { Patient, PatientDetailResponse } from '../models/patient.model.js';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  private selectedPatientSubject = new BehaviorSubject<PatientDetailResponse | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  private get http(): HttpService {
    return AppInjector.get(HttpService);
  }

  public get patients$(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  public get selectedPatient$(): Observable<PatientDetailResponse | null> {
    return this.selectedPatientSubject.asObservable();
  }

  public get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public async fetchPatients(query = '', status = 'All'): Promise<Patient[]> {
    this.loadingSubject.next(true);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (status && status !== 'All') params.status = status;

    const res = await this.http.get<Patient[]>('/patients', params);
    this.loadingSubject.next(false);

    if (res.success && Array.isArray(res.data)) {
      this.patientsSubject.next(res.data);
      return res.data;
    }
    return [];
  }

  public async selectPatient(id: number): Promise<PatientDetailResponse | null> {
    this.loadingSubject.next(true);
    const res = await this.http.get<PatientDetailResponse>(`/patients/${id}`);
    this.loadingSubject.next(false);

    if (res.success && res.data) {
      this.selectedPatientSubject.next(res.data);
      return res.data;
    }
    return null;
  }

  public clearSelectedPatient(): void {
    this.selectedPatientSubject.next(null);
  }

  public async registerPatient(patientData: Partial<Patient>): Promise<{ success: boolean; data?: Patient; error?: string }> {
    const res = await this.http.post<Patient>('/patients', patientData);
    if (res.success && res.data) {
      // Refresh list
      await this.fetchPatients();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to register patient' };
  }
}
