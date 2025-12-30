import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AutoLogoutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3 Minutes in milliseconds
  const TIMEOUT_DURATION = 3 * 60 * 1000; 

  // --- Logout Function ---
  const performLogout = useCallback(() => {
    // 1. Clear the token
    localStorage.removeItem('token');
    
    // 2. Redirect to Login (assuming '/' is your login route)
    // You can also add a query param to show a message like "Session Expired"
    navigate('/'); 
    
    console.log("User logged out due to inactivity.");
  }, [navigate]);

  // --- Reset Timer Logic ---
  const resetTimer = useCallback(() => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only start the timer if the user is currently logged in (has a token)
    // and is NOT already on the login page (to prevent loops)
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname === '/'; // Update this if your login route is different, e.g., '/login'

    if (token && !isLoginPage) {
      timerRef.current = setTimeout(performLogout, TIMEOUT_DURATION);
    }
  }, [performLogout, location.pathname]);

  // --- Setup Event Listeners ---
  useEffect(() => {
    // Events that define "activity"
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

    // Attach listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start the timer initially when component mounts or route changes
    resetTimer();

    // Cleanup listeners on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return null; // This component does not render anything visually
};

export default AutoLogoutHandler;