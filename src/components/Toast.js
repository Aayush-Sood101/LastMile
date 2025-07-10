'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

// Toast context to manage global toast notifications
import React, { createContext, useContext } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };
  
  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { id, message, type, duration } = toast;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (duration === Infinity) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + (100 / (duration / 100));
        }
        clearInterval(interval);
        return 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-white" />;
      case 'error':
        return <FaTimesCircle className="text-white" />;
      case 'warning':
        return <FaExclamationTriangle className="text-white" />;
      case 'info':
        return <FaInfoCircle className="text-white" />;
      default:
        return <FaInfoCircle className="text-white" />;
    }
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
        return 'bg-blue-600';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg ${getToastStyle()} min-w-[300px] max-w-md`}
         role="alert">
      <div className="flex-shrink-0 mr-3">
        {getToastIcon()}
      </div>
      <div className="flex-grow mr-2 text-white">
        {message}
      </div>
      <button
        className="flex-shrink-0 text-white hover:text-gray-200 focus:outline-none"
        onClick={onClose}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"/>
        </svg>
      </button>
      {duration !== Infinity && (
        <div className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-40" style={{ width: `${progress}%` }}></div>
      )}
    </div>
  );
}
