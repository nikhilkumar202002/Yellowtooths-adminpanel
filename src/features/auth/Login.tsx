import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha"; 
import { login } from "../../services/authService";
import "../styles/Styles.css";

const Login = () => {
  const navigate = useNavigate();
  // Ref for the reCAPTCHA widget
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Execute reCAPTCHA and get the token
      const token = await recaptchaRef.current?.executeAsync();

      if (!token) {
        throw new Error("reCAPTCHA verification failed. Please try again.");
      }

      // 2. Pass the token to the login service
      const data = await login(email, password, token);
      
      console.log("Login successful:", data);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(errorMessage);
      
      // Reset captcha on error so user can try again
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="login min-h-screen flex items-center justify-center bg-black">
        <div className="login-container w-full max-w-md px-6">
          <div className="login-card rounded-2xl border border-yellow-500/20 bg-[#0b0b0b] p-8 shadow-[0_0_40px_rgba(255,193,7,0.12)]">

            <header className="login-header text-center mb-8">
              <h2 className="text-3xl font-semibold text-yellow-400 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-neutral-400 mt-2">
                Sign in to your account
              </p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded text-center">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="block text-sm text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input"
                  placeholder="you@yellowtooths.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm text-neutral-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                  placeholder="••••••••"
                />
              </div>

              {/* Invisible reCAPTCHA Component */}
              <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible" // This makes it invisible
                sitekey="6Lf3kDosAAAAAGN0fm1IaNL-y2kguEvXaUCArG41" // Replace with your actual Site Key
                theme="dark" // Matches your dark theme
              />

              <button 
                type="submit" 
                className="login-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          </div>
        </div>
      </section>
    </>
  );
}

export default Login;