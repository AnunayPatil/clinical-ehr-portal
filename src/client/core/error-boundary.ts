/**
 * Clinical EHR Error Boundary & Telemetry Handler
 * Traps runtime UI errors, network failures, and unhandled promise rejections.
 * Ensures clinical data integrity by isolating fault domains without crashing the application.
 */

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  source: string;
  stack?: string;
  context?: any;
  recovered: boolean;
}

export class ErrorBoundaryService {
  private static instance: ErrorBoundaryService;
  private errorListeners: ((report: ErrorReport) => void)[] = [];
  private capturedErrors: ErrorReport[] = [];

  constructor() {
    this.initGlobalHooks();
  }

  public static getInstance(): ErrorBoundaryService {
    if (!ErrorBoundaryService.instance) {
      ErrorBoundaryService.instance = new ErrorBoundaryService();
    }
    return ErrorBoundaryService.instance;
  }

  private initGlobalHooks(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.handleException(event.error || new Error(event.message), 'Window Global Error');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleException(event.reason || new Error('Unhandled Promise Rejection'), 'Async Promise Rejection');
    });
  }

  public handleException(error: any, source = 'Clinical Boundary Handler', context?: any): ErrorReport {
    const report: ErrorReport = {
      id: `ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: error?.message || String(error),
      source,
      stack: error?.stack,
      context,
      recovered: true
    };

    this.capturedErrors.unshift(report);
    if (this.capturedErrors.length > 50) {
      this.capturedErrors.pop();
    }

    console.warn(`[Clinical Error Boundary Trapped] [${report.source}]: ${report.message}`, report);
    this.notifyListeners(report);
    return report;
  }

  public subscribe(listener: (report: ErrorReport) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(report: ErrorReport): void {
    for (const listener of this.errorListeners) {
      try {
        listener(report);
      } catch (err) {
        console.error('Error in error boundary listener:', err);
      }
    }
  }

  public getHistory(): ErrorReport[] {
    return [...this.capturedErrors];
  }

  public clear(): void {
    this.capturedErrors = [];
  }
}
