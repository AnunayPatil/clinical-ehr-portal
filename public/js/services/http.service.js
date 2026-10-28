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
import { ErrorBoundaryService } from '../core/error-boundary.js';
import { NotificationService } from './notification.service.js';
let HttpService = class HttpService {
    baseUrl = '/api';
    errorBoundary = ErrorBoundaryService.getInstance();
    constructor() { }
    get notification() {
        return AppInjector.get(NotificationService);
    }
    async get(endpoint, params) {
        let url = `${this.baseUrl}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams();
            for (const [key, val] of Object.entries(params)) {
                if (val !== undefined && val !== null && val !== '') {
                    searchParams.append(key, val);
                }
            }
            const qs = searchParams.toString();
            if (qs)
                url += `?${qs}`;
        }
        return this.request(url, { method: 'GET' });
    }
    async post(endpoint, body) {
        const url = `${this.baseUrl}${endpoint}`;
        return this.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        });
    }
    async patch(endpoint, body) {
        const url = `${this.baseUrl}${endpoint}`;
        return this.request(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body || {})
        });
    }
    async request(url, options) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const json = await response.json();
            if (!response.ok) {
                const errorMsg = json.error || `HTTP ${response.status}: Request failed`;
                this.errorBoundary.handleException(new Error(errorMsg), `API [${options.method} ${url}]`, {
                    status: response.status,
                    response: json
                });
                return {
                    success: false,
                    data: null,
                    error: errorMsg,
                    status: response.status
                };
            }
            return {
                success: true,
                data: json.data !== undefined ? json.data : json,
                message: json.message,
                status: response.status
            };
        }
        catch (err) {
            const isAbort = err.name === 'AbortError';
            const msg = isAbort ? 'Network Request Timeout (12s exceeded)' : (err.message || 'Network Communication Error');
            this.errorBoundary.handleException(err, `Network Exception [${options.method} ${url}]`);
            this.notification.error('API Error', msg);
            return {
                success: false,
                data: null,
                error: msg,
                status: 0
            };
        }
    }
};
HttpService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], HttpService);
export { HttpService };
