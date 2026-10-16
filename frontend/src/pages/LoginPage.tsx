import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, ArrowRight, Lock, Mail, Terminal } from 'lucide-react';

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
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'AUTHENTICATION_FAILED // INVALID_CREDENTIALS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      setError(null);
      await demoLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'FAILED TO INITIALIZE DEMO OPERATOR');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-telemetry-grid font-sans">
      {/* Background radial beacon */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Card container */}
      <div className="w-full max-w-md bg-carbon-900 border border-carbon-750 p-8 shadow-2xl relative z-10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-carbon-800 font-mono text-[10px] text-carbon-500 uppercase tracking-widest">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-carbon-300 font-semibold">TERMINAL_01 // ACCESS_GATEWAY</span>
          </span>
          <span className="text-emerald-400">READY</span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-extrabold text-2xl uppercase tracking-wider text-white">
            TEAM<span className="text-cyan-400">SYNC</span>
          </h1>
          <p className="font-mono text-[11px] text-carbon-400 mt-1 uppercase tracking-wider">
            REAL-TIME COLLABORATION DISPATCH
          </p>
        </div>

        {/* 1-Click Launch Demo Button (Telemetry styled) */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isDemoLoading || isLoading}
          className="w-full mb-6 p-3.5 bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/50 hover:border-cyan-400 text-left transition font-mono group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-600/20 border border-cyan-500/60 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  ⚡ LAUNCH DEMO SESSION
                </div>
                <div className="text-[10px] text-cyan-300/80 uppercase">
                  RECRUITER / REVIEWER INSTANT PASS
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-carbon-800 w-full" />
          <span className="bg-carbon-900 px-3 font-mono text-[10px] uppercase font-bold tracking-widest text-carbon-500 absolute">
            OR OPERATOR CREDENTIALS
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/30 border border-rose-800/80 font-mono text-[11px] text-rose-300 uppercase">
            // ERR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-carbon-400 mb-1.5">
              OPERATOR EMAIL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-carbon-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@teamsync.dev"
                className="w-full bg-carbon-850 border border-carbon-750 pl-9 pr-3 py-2 text-xs text-white placeholder-carbon-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-carbon-400 mb-1.5">
              PASSKEY
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-carbon-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-carbon-850 border border-carbon-750 pl-9 pr-3 py-2 text-xs text-white placeholder-carbon-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isDemoLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-carbon-100 disabled:opacity-50 text-carbon-950 text-xs font-bold uppercase tracking-wider transition shadow-sm mt-3"
          >
            {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & CONNECT'}
          </button>
        </form>

        <p className="text-center font-mono text-[11px] text-carbon-500 mt-6 uppercase">
          NEW OPERATOR?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold ml-1">
            INITIALIZE ACCOUNT
          </Link>
        </p>
      </div>
    </div>
  );
};
