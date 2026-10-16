import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
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
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
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
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      {/* Subtle radial ambient highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[320px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-sm mb-4 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center space-x-1 text-xs text-zinc-400 hover:text-white transition"
        >
          <span>← Back to TeamSync</span>
        </Link>
      </div>

      {/* Card container */}
      <div className="w-full max-w-sm bg-surface-900 border border-border-subtle rounded-xl p-7 shadow-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-accent/20">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            Log in to TeamSync
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time collaboration for engineering teams
          </p>
        </div>

        {/* 1-Click Demo Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isDemoLoading || isLoading}
          className="w-full mb-5 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-border-subtle hover:border-border-hover rounded-lg transition flex items-center justify-between text-left group"
        >
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <div>
              <div className="text-xs font-medium text-zinc-200">Demo User Pass</div>
              <div className="text-[11px] text-zinc-500">Explore instantly with 1-click</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 group-hover:text-zinc-300 transition" />
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-border-subtle w-full" />
          <span className="bg-surface-900 px-2 text-[11px] font-medium text-zinc-500 absolute">
            or continue with email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-surface-950 border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/80 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-950 border border-border-subtle rounded-md px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent/80 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full py-2 px-3 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 text-xs font-medium rounded-md transition shadow-sm mt-1"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-white hover:underline font-medium ml-0.5">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
