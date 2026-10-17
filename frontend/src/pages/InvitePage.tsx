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
    <div className="min-h-[100dvh] bg-graphite-bg flex flex-col justify-center items-center px-4 py-12 relative font-jost text-graphite-ink select-none">
      <div
        data-ui="card"
        className="w-full max-w-sm bg-graphite-surface rounded-xl p-7 text-center relative"
      >
        <div className="w-10 h-10 rounded-lg bg-graphite-bg text-graphite-orange flex items-center justify-center mx-auto mb-3 font-bold">
          <UserPlus className="w-5 h-5" />
        </div>

        <h2 className="text-lg font-bold text-graphite-ink tracking-tight">
          Workspace Invitation
        </h2>
        <p className="text-xs text-graphite-muted mt-1 font-normal">
          You've been invited to collaborate with your team on TeamSync.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 rounded-lg text-xs text-rose-300 font-medium">
            {error}
          </div>
        )}

        {!user ? (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-graphite-muted">
              Sign in or create an account to accept:
            </p>
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-graphite-orange hover:opacity-90 active:scale-[0.98] text-graphite-fieldInk text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5"
            >
              <span>Sign in to accept</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="p-3 bg-graphite-bg rounded-lg text-left flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded bg-graphite-orange text-graphite-fieldInk flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-graphite-ink truncate">{user.name}</div>
                <div className="text-[11px] text-graphite-muted truncate">{user.email}</div>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-graphite-orange hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-graphite-fieldInk text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5 text-graphite-fieldInk" />
              <span>{isLoading ? 'Joining...' : 'Accept & join workspace'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
