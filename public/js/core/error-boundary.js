/**
 * Clinical EHR Error Boundary & Telemetry Handler
 * Traps runtime UI errors, network failures, and unhandled promise rejections.
 * Ensures clinical data integrity by isolating fault domains without crashing the application.
 */
export class ErrorBoundaryService {
    static instance;
    errorListeners = [];
    capturedErrors = [];
    constructor() {
        this.initGlobalHooks();
    }
    static getInstance() {
        if (!ErrorBoundaryService.instance) {
            ErrorBoundaryService.instance = new ErrorBoundaryService();
        }
        return ErrorBoundaryService.instance;
    }
    initGlobalHooks() {
        if (typeof window === 'undefined')
            return;
        window.addEventListener('error', (event) => {
            this.handleException(event.error || new Error(event.message), 'Window Global Error');
        });
        window.addEventListener('unhandledrejection', (event) => {
            this.handleException(event.reason || new Error('Unhandled Promise Rejection'), 'Async Promise Rejection');
        });
    }
    handleException(error, source = 'Clinical Boundary Handler', context) {
        const report = {
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
    subscribe(listener) {
        this.errorListeners.push(listener);
        return () => {
            this.errorListeners = this.errorListeners.filter(l => l !== listener);
        };
    }
    notifyListeners(report) {
        for (const listener of this.errorListeners) {
            try {
                listener(report);
            }
            catch (err) {
                console.error('Error in error boundary listener:', err);
            }
        }
    }
    getHistory() {
        return [...this.capturedErrors];
    }
    clear() {
        this.capturedErrors = [];
    }
}
