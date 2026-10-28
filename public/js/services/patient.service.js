var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, AppInjector } from '../core/di-container.js';
import { HttpService } from './http.service.js';
import { BehaviorSubject } from '../core/event-bus.js';
let PatientService = class PatientService {
    patientsSubject = new BehaviorSubject([]);
    selectedPatientSubject = new BehaviorSubject(null);
    loadingSubject = new BehaviorSubject(false);
    constructor() { }
    get http() {
        return AppInjector.get(HttpService);
    }
    get patients$() {
        return this.patientsSubject.asObservable();
    }
    get selectedPatient$() {
        return this.selectedPatientSubject.asObservable();
    }
    get loading$() {
        return this.loadingSubject.asObservable();
    }
    async fetchPatients(query = '', status = 'All') {
        this.loadingSubject.next(true);
        const params = {};
        if (query)
            params.q = query;
        if (status && status !== 'All')
            params.status = status;
        const res = await this.http.get('/patients', params);
        this.loadingSubject.next(false);
        if (res.success && Array.isArray(res.data)) {
            this.patientsSubject.next(res.data);
            return res.data;
        }
        return [];
    }
    async selectPatient(id) {
        this.loadingSubject.next(true);
        const res = await this.http.get(`/patients/${id}`);
        this.loadingSubject.next(false);
        if (res.success && res.data) {
            this.selectedPatientSubject.next(res.data);
            return res.data;
        }
        return null;
    }
    clearSelectedPatient() {
        this.selectedPatientSubject.next(null);
    }
    async registerPatient(patientData) {
        const res = await this.http.post('/patients', patientData);
        if (res.success && res.data) {
            // Refresh list
            await this.fetchPatients();
            return { success: true, data: res.data };
        }
        return { success: false, error: res.error || 'Failed to register patient' };
    }
};
PatientService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], PatientService);
export { PatientService };
