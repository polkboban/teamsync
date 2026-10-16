import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaces';
import { UserPlus, ArrowRight, CheckCircle2, Radio } from 'lucide-react';

export const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      await workspaceApi.acceptInvite(token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'TOKEN_INVALID_OR_EXPIRED // CONTACT ADMIN');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col justify-center items-center px-4 py-12 relative bg-telemetry-grid font-sans">
      <div className="w-full max-w-md bg-carbon-900 border border-carbon-750 p-8 shadow-2xl text-center">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-carbon-800 font-mono text-[10px] text-carbon-500 uppercase tracking-widest">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-carbon-300 font-semibold">TOKEN_VERIFICATION // GATEWAY</span>
          </span>
          <span className="text-emerald-400">ACTIVE</span>
        </div>

        <div className="w-12 h-12 bg-carbon-800 border border-carbon-700 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-6 h-6" />
        </div>

        <h2 className="font-display font-bold text-lg text-white uppercase tracking-wider">
          WORKSPACE ACCESS INVITATION
        </h2>
        <p className="font-mono text-xs text-carbon-400 mt-2 leading-relaxed uppercase">
          SECURITY PROTOCOL: JOIN WORKSPACE DISPATCH AS VERIFIED OPERATOR
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-800/80 font-mono text-xs text-rose-300 uppercase">
            // ERR: {error}
          </div>
        )}

        {!user ? (
          <div className="mt-6 space-y-3 font-mono">
            <p className="text-[11px] text-carbon-400 uppercase">
              AUTHENTICATION REQUIRED TO ACCEPT INVITATION TOKEN:
            </p>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-white hover:bg-carbon-100 text-carbon-950 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2"
            >
              <span>AUTHENTICATE TO JOIN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4 font-mono">
            <div className="p-3 bg-carbon-850 border border-carbon-750 text-left flex items-center space-x-3">
              <div className="w-7 h-7 bg-cyan-600 text-carbon-950 flex items-center justify-center text-xs font-bold uppercase font-display">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white uppercase tracking-tight">{user.name}</div>
                <div className="text-[10px] text-carbon-400">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-carbon-950 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-glow-cyan"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'ENROLLING...' : 'ACCEPT & JOIN DISPATCH'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
