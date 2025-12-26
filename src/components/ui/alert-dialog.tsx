'use client';

import * as React from 'react';
import { Button } from './button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  showCancel?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  showCancel = true
}: AlertDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getIconAndColor = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: 'fa-exclamation-triangle',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          icon: 'fa-check-circle',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonClass: 'bg-green-600 hover:bg-green-700'
        };
      case 'warning':
        return {
          icon: 'fa-exclamation-circle',
          bgColor: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonClass: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          icon: 'fa-info-circle',
          bgColor: 'bg-[#AD6269]/10',
          iconColor: 'text-[#AD6269]',
          buttonClass: 'bg-[#AD6269] hover:bg-[#9d5860]'
        };
    }
  };

  const { icon, bgColor, iconColor, buttonClass } = getIconAndColor();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <i className={`fas ${icon} text-xl ${iconColor}`}></i>
          </div>
          
          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 text-center text-sm">
            {description}
          </p>
        </div>
        
        {/* Actions */}
        <div className={`flex ${showCancel ? 'gap-3' : ''} p-4 bg-gray-50 border-t border-gray-100`}>
          {showCancel && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              {cancelText}
            </Button>
          )}
          <Button
            className={`flex-1 text-white ${buttonClass}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
interface UseAlertDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  showCancel?: boolean;
}

interface AlertDialogState {
  open: boolean;
  options: UseAlertDialogOptions;
  resolve: ((value: boolean) => void) | null;
}

export function useAlertDialog() {
  const [state, setState] = React.useState<AlertDialogState>({
    open: false,
    options: { title: '', description: '' },
    resolve: null
  });

  const showAlert = React.useCallback((options: UseAlertDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options: { ...options, showCancel: options.showCancel ?? false },
        resolve
      });
    });
  }, []);

  const showConfirm = React.useCallback((options: UseAlertDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options: { ...options, showCancel: true },
        resolve
      });
    });
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open && state.resolve) {
      state.resolve(false);
    }
    setState(prev => ({ ...prev, open }));
  }, [state.resolve]);

  const handleConfirm = React.useCallback(() => {
    if (state.resolve) {
      state.resolve(true);
    }
    setState(prev => ({ ...prev, open: false }));
  }, [state.resolve]);

  const handleCancel = React.useCallback(() => {
    if (state.resolve) {
      state.resolve(false);
    }
    setState(prev => ({ ...prev, open: false }));
  }, [state.resolve]);

  const DialogComponent = React.useMemo(() => (
    <AlertDialog
      open={state.open}
      onOpenChange={handleOpenChange}
      title={state.options.title}
      description={state.options.description}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      variant={state.options.variant}
      showCancel={state.options.showCancel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [state, handleOpenChange, handleConfirm, handleCancel]);

  return {
    showAlert,
    showConfirm,
    AlertDialogComponent: DialogComponent
  };
}
