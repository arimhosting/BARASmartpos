import React, { useEffect } from 'react';
import { ToastMessage, ToastType } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-800 dark:text-white ${icon ? 'pl-10 pr-3' : 'px-3'} ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden ${className}`}>
      {title && <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 font-semibold text-lg text-gray-900 dark:text-white">{title}</div>}
      <div className="p-6">{children}</div>
    </div>
  );
};

// --- Toast Notification ---

const Toast: React.FC<{ message: ToastMessage; onClose: (id: string) => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 4000); // Auto dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [message.id, onClose]);

  const getIcon = () => {
    switch (message.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      case 'info': return 'border-l-blue-500';
    }
  };

  return (
    <div className={`flex items-start gap-3 w-80 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 border-l-4 ${getBorderColor()} mb-3 animate-slide-in-right relative overflow-hidden`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{message.message}</p>
      </div>
      <button onClick={() => onClose(message.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
};