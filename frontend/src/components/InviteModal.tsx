import React, { useState } from 'react';
import { X, UserPlus, Copy, Check, Shield } from 'lucide-react';
import { workspaceApi } from '../api/workspaces';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}) => {
  const [role, setRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await workspaceApi.createInvite(workspaceId, role);
      const link = `${window.location.origin}/invite/${res.inviteToken}`;
      setInviteLink(link);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate invite token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 font-jost">
      <div
        data-ui="modal"
        className="bg-graphite-surface rounded-xl w-full max-w-md p-6 relative border border-graphite-bg"
      >
        <div data-ui="modal-header" className="flex items-center justify-between pb-3 border-b border-graphite-bg">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-graphite-bg flex items-center justify-center text-graphite-orange">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-graphite-ink tracking-tight">
                Invite to Workspace
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-graphite-muted mt-3 leading-relaxed">
          Generate an ephemeral, 48-hour single-use invitation link for{' '}
          <span className="text-graphite-ink font-bold">{workspaceName}</span>.
        </p>

        {error && (
          <div className="mt-3 p-3 bg-rose-950/40 text-rose-300 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-graphite-muted mb-1.5 uppercase">
              Role & permissions
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setRole('MEMBER'); setInviteLink(null); }}
                className={`p-3 rounded-lg text-left transition ${
                  role === 'MEMBER'
                    ? 'bg-graphite-orange text-graphite-fieldInk font-bold'
                    : 'bg-graphite-bg text-graphite-muted hover:text-graphite-ink'
                }`}
              >
                <div className="text-xs font-bold">Member</div>
                <div className="text-[10px] opacity-80 mt-0.5">View, create & move tasks</div>
              </button>

              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setInviteLink(null); }}
                className={`p-3 rounded-lg text-left transition ${
                  role === 'ADMIN'
                    ? 'bg-graphite-orange text-graphite-fieldInk font-bold'
                    : 'bg-graphite-bg text-graphite-muted hover:text-graphite-ink'
                }`}
              >
                <div className="text-xs font-bold flex items-center space-x-1">
                  <span>Admin</span>
                  <Shield className="w-3 h-3" />
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">Manage boards, lists & team</div>
              </button>
            </div>
          </div>

          {!inviteLink ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-graphite-orange hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-graphite-fieldInk text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Generating link...' : 'Generate invite link'}</span>
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-emerald-400">
                Active invite link (expires in 48 hours)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-graphite-bg rounded-lg px-3 py-2 text-xs text-graphite-ink font-medium select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-lg transition flex items-center justify-center ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-graphite-bg hover:bg-graphite-elevated text-graphite-ink'
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-graphite-muted">
                Single-use link powered by Redis key expiry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
