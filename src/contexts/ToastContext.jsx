import { createContext, useState } from "react";

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);

  function showToast(text) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="global-toast">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}