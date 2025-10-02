import { createContext } from 'react';
import type { ToastType } from '../components/Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  showToast: (message: string, type: ToastType, action?: ToastMessage['action']) => void;
  hideToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
