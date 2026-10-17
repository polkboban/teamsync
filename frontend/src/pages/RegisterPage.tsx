import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await register(name, email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      setError(null);
      await demoLogin();
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to authenticate demo user');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-graphite-bg text-graphite-ink font-jost selection:bg-graphite-orange selection:text-graphite-fieldInk p-2 sm:p-3 flex flex-col justify-between space-y-2">
      {/* Top Nav Tile */}
      <nav className="grid grid-cols-12 gap-2">
        <div className="col-span-6 sm:col-span-3 h-14 bg-graphite-surface rounded-lg flex items-center px-4">
          <Link to="/" className="font-jost text-lg font-bold tracking-tight text-graphite-ink">
            TEAMSYNC
          </Link>
        </div>

        <div className="col-span-6 sm:col-span-9 h-14 bg-graphite-surface rounded-lg flex items-center justify-end px-4 sm:px-6">
          <Link
            to="/"
            className="text-xs sm:text-sm font-medium text-graphite-muted hover:text-graphite-ink transition"
          >
            ← Back to Overview
          </Link>
        </div>
      </nav>

      {/* Main Board of Fitted Tiles */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-2 my-auto py-4">
        {/* Left: Brand & Registration Info Tile */}
        <div className="md:col-span-5 bg-graphite-field text-graphite-fieldInk rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
          <div>
            <span className="text-xs font-bold tracking-normal text-graphite-fieldInk">
              ORGANIZATION REGISTRATION
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mt-4 leading-none text-graphite-fieldInk">
              CREATE WORKSPACE.
            </h1>
          </div>

          <div className="space-y-2 my-6">
            <p className="text-sm font-medium leading-relaxed text-graphite-fieldInk opacity-90">
              Create a production workspace for your team. Includes multi-tenant isolation, real-time board sync, and Redis-backed invite links.
            </p>
          </div>

          <div className="text-xs font-bold text-graphite-fieldInk opacity-80">
            ZERO CONFIGURATION · INSTANT ACCESS
          </div>
        </div>

        {/* Right: Registration Form Tile */}
        <div className="md:col-span-7 bg-graphite-surface rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[420px]">
          {/* 1-Click Instant Demo Pass */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isLoading}
            className="w-full p-4 rounded-lg bg-graphite-orange text-graphite-fieldInk hover:opacity-90 active:scale-[0.98] transition flex items-center justify-between text-left mb-5"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold">SKIP REGISTRATION</div>
                <div className="text-sm font-bold">
                  {isDemoLoading ? 'Authenticating demo user...' : 'Try 1-Click Demo Account'}
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 ml-2" />
          </button>

          <div className="text-xs text-graphite-muted font-medium mb-3">
            Or register with email credentials
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 text-rose-300 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-graphite-ink mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-graphite-bg text-graphite-ink rounded-lg px-4 py-2.5 text-xs placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-graphite-ink mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-graphite-bg text-graphite-ink rounded-lg px-4 py-2.5 text-xs placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-graphite-ink mb-1">
                Password (min. 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-graphite-bg text-graphite-ink rounded-lg px-4 py-2.5 text-xs placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isDemoLoading}
              className="w-full py-3 bg-graphite-ink text-graphite-bg font-jost font-bold text-xs sm:text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition mt-2"
            >
              {isLoading ? 'Creating account...' : 'Create Workspace Account'}
            </button>
          </form>

          <p className="text-xs text-graphite-muted text-center mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-graphite-orange font-bold hover:underline ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="h-10 bg-graphite-surface rounded-lg px-4 flex items-center justify-between text-xs text-graphite-muted">
        <span>TeamSync Registration Protocol</span>
        <span>All systems operational</span>
      </footer>
    </div>
  );
};
