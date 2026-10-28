import { Injectable, AppInjector } from '../core/di-container.js';
import { ErrorBoundaryService } from '../core/error-boundary.js';
import { NotificationService } from './notification.service.js';

export interface HttpResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private baseUrl = '/api';
  private errorBoundary = ErrorBoundaryService.getInstance();

  constructor() {}

  private get notification(): NotificationService {
    return AppInjector.get(NotificationService);
  }

  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<HttpResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
  }

  public async patch<T>(endpoint: string, body?: any): Promise<HttpResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.request<T>(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
  }

  private async request<T>(url: string, options: RequestInit): Promise<HttpResponse<T>> {
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
          data: null as any,
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
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      const msg = isAbort ? 'Network Request Timeout (12s exceeded)' : (err.message || 'Network Communication Error');
      this.errorBoundary.handleException(err, `Network Exception [${options.method} ${url}]`);
      this.notification.error('API Error', msg);
      return {
        success: false,
        data: null as any,
        error: msg,
        status: 0
      };
    }
  }
}
