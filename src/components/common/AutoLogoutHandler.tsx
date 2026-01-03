import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAuth } from '../../services/authService'; // Ensure this import matches your structure

const AutoLogoutHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Refs to manage timers
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- CONFIGURATION ---
  const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 Minutes Idle Timeout
  const CHECK_INTERVAL = 5000;        // 5 Seconds Token Check

  // --- Core Logout Logic ---
  const performLogout = useCallback(() => {
    // 1. Clear local storage
    localStorage.removeItem('token');
    
    // 2. Clear all timers to prevent loops
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // 3. Redirect if not already on login page
    // Adjust paths ('/' or '/login') based on your routing
    if (location.pathname !== '/' && location.pathname !== '/login') {
      console.log("Session expired or invalid. Logging out.");
      navigate('/'); 
    }
  }, [navigate, location.pathname]);

  // --- Feature 1: Idle Timer (5 Mins) ---
  const resetIdleTimer = useCallback(() => {
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname === '/' || location.pathname === '/login';

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Only start timer if logged in and not on login page
    if (token && !isLoginPage) {
      idleTimerRef.current = setTimeout(() => {
        console.log("User inactive for 5 minutes.");
        performLogout();
      }, IDLE_TIMEOUT);
    }
  }, [performLogout, location.pathname, IDLE_TIMEOUT]);

  // --- Feature 2: Token Polling (Every 5 Sec) ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname === '/' || location.pathname === '/login';

    const verifyToken = async () => {
      try {
        // Calls GET /user-check
        await checkAuth(); 
        // If 200 OK, do nothing (session is valid)
      } catch (error) {
        // If 401 or backend session deleted, this block runs
        console.log("Backend session check failed.");
        performLogout();
      }
    };

    // Start polling if logged in
    if (token && !isLoginPage) {
      // Run immediately once
      verifyToken();
      // Then run every 5 seconds
      intervalRef.current = setInterval(verifyToken, CHECK_INTERVAL);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location.pathname, performLogout, CHECK_INTERVAL]);

  // --- Event Listeners for Idle Timer ---
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    
    const handleActivity = () => resetIdleTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetIdleTimer(); // Initialize on mount

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [resetIdleTimer]);

  return null;
};

export default AutoLogoutHandler;