var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '../core/di-container.js';
let NotificationService = class NotificationService {
    containerEl = null;
    constructor() {
        this.ensureContainer();
    }
    ensureContainer() {
        if (typeof document === 'undefined')
            return;
        let el = document.getElementById('toast-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast-container';
            el.className = 'toast-container';
            document.body.appendChild(el);
        }
        this.containerEl = el;
    }
    show(type, title, message, durationMs = 4000) {
        this.ensureContainer();
        if (!this.containerEl)
            return;
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">${this.getIcon(type)}</span>
        <strong class="toast-title">${title}</strong>
        <button class="toast-close" aria-label="Close">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;
        toast.querySelector('.toast-close')?.addEventListener('click', () => {
            this.removeToast(toast);
        });
        this.containerEl.appendChild(toast);
        if (durationMs > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, durationMs);
        }
    }
    success(title, message) {
        this.show('success', title, message);
    }
    error(title, message) {
        this.show('error', title, message, 6000);
    }
    warning(title, message) {
        this.show('warning', title, message, 5000);
    }
    info(title, message) {
        this.show('info', title, message);
    }
    removeToast(el) {
        el.classList.add('toast-exit');
        setTimeout(() => {
            if (el.parentElement) {
                el.parentElement.removeChild(el);
            }
        }, 250);
    }
    getIcon(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
        }
    }
};
NotificationService = __decorate([
    Injectable({ providedIn: 'root' }),
    __metadata("design:paramtypes", [])
], NotificationService);
export { NotificationService };
