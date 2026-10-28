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
let AppointmentService = class AppointmentService {
    appointmentsSubject = new BehaviorSubject([]);
    loadingSubject = new BehaviorSubject(false);
    constructor() { }
    get http() {
        return AppInjector.get(HttpService);
    }
    get appointments$() {
        return this.appointmentsSubject.asObservable();
    }
    get loading$() {
        return this.loadingSubject.asObservable();
    }
    async fetchAppointments(status = 'All') {
        this.loadingSubject.next(true);
        const params = {};
        if (status && status !== 'All')
            params.status = status;
        const res = await this.http.get('/appointments', params);
        this.loadingSubject.next(false);
        if (res.success && Array.isArray(res.data)) {
            this.appointmentsSubject.next(res.data);
            return res.data;
        }
        return [];
    }
    async scheduleAppointment(data) {
        const res = await this.http.post('/appointments', data);
        if (res.success && res.data) {
            await this.fetchAppointments();
            return { success: true, data: res.data };
        }
        return { success: false, error: res.error || 'Failed to schedule appointment' };
    }
    async updateStatus(id, status) {
        const res = await this.http.patch(`/appointments/${id}/status`, { status });
        if (res.success) {
            const current = this.appointmentsSubject.value;
            const updated = current.map(a => (a.id === id ? { ...a, status } : a));
            this.appointmentsSubject.next(updated);
            return true;
        }
        return false;
    }
};
AppointmentService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], AppointmentService);
export { AppointmentService };
