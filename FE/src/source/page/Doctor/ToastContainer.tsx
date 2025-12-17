import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { toastManager, type ToastMessage } from '../../../utils/toast'

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts)
    })
    return unsubscribe
  }, [])

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }


  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className={`flex items-center p-4 rounded-lg border shadow-xl min-w-[300px] max-w-[400px] transform transition-all duration-300 ease-in-out pointer-events-auto ${getToastStyles(toast.type)}`}
            style={{
              animation: 'slideInRight 0.3s ease-out',
              position: 'relative',
              zIndex: 10000
            }}
          >
            {getToastIcon(toast.type)}
            <span className="ml-3 text-sm font-medium flex-1">
              {toast.message}
            </span>
            <button
              onClick={() => {
                toastManager.remove(toast.id)
              }}
              className="ml-2 flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default ToastContainer
