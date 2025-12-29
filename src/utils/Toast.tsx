import { toast, Toaster, type DefaultToastOptions } from 'react-hot-toast';

// Custom styles to match your Yellow/Dark theme
// We use DefaultToastOptions here because it allows 'success' and 'error' keys
const toastConfig: DefaultToastOptions = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid rgba(255, 193, 7, 0.2)', // Yellow border
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  success: {
    iconTheme: {
      primary: '#eab308', // Yellow-500
      secondary: '#000',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444', // Red-500
      secondary: '#fff',
    },
  },
};

// Component to place in App.tsx
export const GlobalToaster = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={toastConfig}
    />
  );
};

// Reusable functions
export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showLoading = (message: string) => toast.loading(message);
export const dismissToast = (toastId: string) => toast.dismiss(toastId);

export default toast;