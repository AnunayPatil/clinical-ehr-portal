import { Injectable } from '../core/di-container.js';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private containerEl: HTMLElement | null = null;

  constructor() {
    this.ensureContainer();
  }

  private ensureContainer(): void {
    if (typeof document === 'undefined') return;
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
    this.containerEl = el;
  }

  public show(type: ToastType, title: string, message: string, durationMs = 4000): void {
    this.ensureContainer();
    if (!this.containerEl) return;

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

  public success(title: string, message: string): void {
    this.show('success', title, message);
  }

  public error(title: string, message: string): void {
    this.show('error', title, message, 6000);
  }

  public warning(title: string, message: string): void {
    this.show('warning', title, message, 5000);
  }

  public info(title: string, message: string): void {
    this.show('info', title, message);
  }

  private removeToast(el: HTMLElement): void {
    el.classList.add('toast-exit');
    setTimeout(() => {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    }, 250);
  }

  private getIcon(type: ToastType): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  }
}
