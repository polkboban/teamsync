import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaces';
import { UserPlus, ArrowRight, Check } from 'lucide-react';

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
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired invitation link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      <div className="w-full max-w-sm bg-surface-900 border border-border-subtle rounded-xl p-7 shadow-xl text-center">
        <div className="w-10 h-10 rounded-full bg-surface-850 border border-border-subtle text-accent flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-semibold text-white tracking-tight">
          Workspace Invitation
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          You've been invited to collaborate with your team on TeamSync.
        </p>

        {error && (
          <div className="mt-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-xs text-rose-300">
            {error}
          </div>
        )}

        {!user ? (
          <div className="mt-5 space-y-2.5">
            <p className="text-xs text-zinc-400">
              Sign in or create an account to accept:
            </p>
            <Link
              to="/login"
              className="w-full py-2 px-3 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium rounded-md transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>Sign in to accept</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-lg text-left flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-full bg-zinc-700 text-white flex items-center justify-center text-xs font-medium uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-medium text-zinc-200 truncate">{user.name}</div>
                <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 text-xs font-medium rounded-md transition flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isLoading ? 'Joining...' : 'Accept & join workspace'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
