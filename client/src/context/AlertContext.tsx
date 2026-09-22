"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  ShieldAlert,
  Flame
} from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: AlertType;
  duration: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertContextValue {
  showToast: (message: string, type?: AlertType, title?: string, duration?: number) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmDialogOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: AlertType = "info", title?: string, duration = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type, duration, title }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, "success", title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, "error", title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, "warning", title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, "info", title), [showToast]);

  const showConfirm = useCallback((options: ConfirmDialogOptions) => {
    setConfirmState(options);
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancelAction = () => {
    if (confirmState?.onCancel) {
      confirmState.onCancel();
    }
    setConfirmState(null);
  };

  return (
    <AlertContext.Provider value={{ showToast, showConfirm, success, error, warning, info }}>
      {children}

      {/* =========================================================================
         TOAST CONTAINER (Top Right)
         ========================================================================= */}
      <div className="fixed top-5 right-4 sm:right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";
            const isWarning = toast.type === "warning";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
                  isSuccess
                    ? "bg-[#091210]/95 border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.25)] text-emerald-100"
                    : isError
                    ? "bg-[#140a0e]/95 border-rose-500/40 shadow-[0_10px_35px_rgba(244,63,94,0.25)] text-rose-100"
                    : isWarning
                    ? "bg-[#140e08]/95 border-amber-500/40 shadow-[0_10px_35px_rgba(245,158,11,0.25)] text-amber-100"
                    : "bg-[#0b0e17]/95 border-[#ffd700]/40 shadow-[0_10px_35px_rgba(255,215,0,0.25)] text-slate-100"
                }`}
              >
                {/* Glow Backdrop */}
                <div
                  className={`absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
                    isSuccess
                      ? "bg-emerald-500/20"
                      : isError
                      ? "bg-rose-500/25"
                      : isWarning
                      ? "bg-amber-500/20"
                      : "bg-[#ff6a00]/25"
                  }`}
                />

                <div className="relative z-10 flex items-start gap-3">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    {isError && <XCircle className="h-5 w-5 text-rose-400" />}
                    {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
                    {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-[#ffd700]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-2">
                    {toast.title && (
                      <h4 className="text-xs font-black uppercase tracking-wider mb-0.5 text-white">
                        {toast.title}
                      </h4>
                    )}
                    <p className="text-xs font-bold leading-snug">{toast.message}</p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Animated Progress Bar */}
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: toast.duration / 1000, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-1 ${
                    isSuccess
                      ? "bg-emerald-400"
                      : isError
                      ? "bg-rose-500"
                      : isWarning
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-orange-500 to-[#ffd700]"
                  }`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* =========================================================================
         CUSTOM CONFIRMATION MODAL
         ========================================================================= */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelAction}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#ff6a00]/35 bg-[#0a0d14] p-6 sm:p-7 shadow-[0_0_50px_rgba(255,106,0,0.25)] text-center overflow-hidden"
            >
              {/* Warm Ambient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-orange-500/20 to-transparent blur-3xl pointer-events-none" />

              {/* Icon */}
              <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-950/40 shadow-inner">
                {confirmState.type === "danger" ? (
                  <ShieldAlert className="h-7 w-7 text-rose-500" />
                ) : (
                  <Flame className="h-7 w-7 text-orange-500" />
                )}
              </div>

              {/* Title & Message */}
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mb-2">
                {confirmState.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed mb-6">
                {confirmState.message}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelAction}
                  disabled={confirmLoading}
                  className="w-1/2 rounded-xl border border-neutral-700 bg-neutral-900/90 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-white hover:border-neutral-500 transition cursor-pointer"
                >
                  {confirmState.cancelText || "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  disabled={confirmLoading}
                  className={`w-1/2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition shadow-lg cursor-pointer ${
                    confirmState.type === "danger"
                      ? "bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white shadow-rose-600/30"
                      : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-black shadow-orange-500/30"
                  }`}
                >
                  {confirmLoading ? "Processing..." : confirmState.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
