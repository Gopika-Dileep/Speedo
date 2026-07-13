import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        
        // Auto-remove toast after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 max-w-md w-full pointer-events-none">
                {toasts.map((toast) => {
                    // Customize styling based on toast type
                    let iconColor = "text-blue-500";
                    let borderColor = "border-blue-500/20";
                    let leftStrip = "bg-blue-500";
                    
                    let svgIcon = (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 4.75h.008v.008H12V4.75zm0 14.5a7.25 7.25 0 100-14.5 7.25 7.25 0 000 14.5z" />
                        </svg>
                    );

                    if (toast.type === "success") {
                        iconColor = "text-emerald-500";
                        borderColor = "border-emerald-500/20";
                        leftStrip = "bg-emerald-500";
                        svgIcon = (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        );
                    } else if (toast.type === "error") {
                        iconColor = "text-rose-500";
                        borderColor = "border-rose-500/20";
                        leftStrip = "bg-rose-500";
                        svgIcon = (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        );
                    }

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-stretch bg-white/95 backdrop-blur-md border ${borderColor} rounded-xl shadow-lg overflow-hidden animate-slide-in transition-all duration-300 w-full`}
                        >
                            {/* Accent stripe */}
                            <div className={`w-1.5 ${leftStrip} shrink-0`}></div>
                            
                            {/* Content area */}
                            <div className="flex items-center justify-between p-4 flex-1 gap-3">
                                <div className="flex items-center gap-3">
                                    <span className={`${iconColor} shrink-0`}>{svgIcon}</span>
                                    <span className="text-slate-700 text-xs font-semibold leading-relaxed">{toast.message}</span>
                                </div>
                                
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100/50 cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
