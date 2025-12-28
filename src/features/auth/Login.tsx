import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from "../../services/authService";
import "../styles/Styles.css";

const Login = () => {
  const navigate = useNavigate();

  // 1. State for form data and UI status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      console.log("Login successful:", data);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      navigate('/dashboard');

    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      setError(errorMessage);
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