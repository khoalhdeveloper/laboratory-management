// Simple toast notification utility
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

class ToastManager {
  private toasts: ToastMessage[] = []
  private listeners: ((toasts: ToastMessage[]) => void)[] = []

  show(type: ToastType, message: string, duration: number = 3000) {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = { id, type, message, duration }
    
    this.toasts.push(toast)
    this.notifyListeners()

    // Auto remove after duration
    setTimeout(() => {
      this.remove(id)
    }, duration)

    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  }

  subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  getToasts() {
    return this.toasts
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts))
  }
}

export const toastManager = new ToastManager()

// Convenience methods
export const toast = {
  success: (message: string, duration?: number) => toastManager.show('success', message, duration),
  error: (message: string, duration?: number) => toastManager.show('error', message, duration),
  warning: (message: string, duration?: number) => toastManager.show('warning', message, duration),
  info: (message: string, duration?: number) => toastManager.show('info', message, duration),
}
