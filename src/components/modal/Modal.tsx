"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;

  /** Your design uses this heavily */
  className?: string;
};

export default function Modal({ isOpen, onClose, children, className = "" }: ModalProps) {
  // ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[1px]"
      />

      {/* Panel - matches your design (max-w, padding passed in via className) */}
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "relative z-10 w-full rounded-2xl bg-white shadow-theme-xs dark:bg-gray-900",
          "max-h-[85vh] overflow-hidden", // allow inner scroll like your modal body
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
