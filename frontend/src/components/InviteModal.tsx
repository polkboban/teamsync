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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-surface-900 border border-border-subtle rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-border-subtle flex items-center justify-center text-zinc-300">
              <UserPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Invite to Workspace
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Create a secure, 48-hour single-use link to invite a teammate to{' '}
          <span className="text-zinc-200 font-medium">{workspaceName}</span>.
        </p>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Role & permissions
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setRole('MEMBER'); setInviteLink(null); }}
                className={`p-3 rounded-lg border text-left transition ${
                  role === 'MEMBER'
                    ? 'border-accent/80 bg-accent/[0.08] text-white ring-1 ring-accent/30'
                    : 'border-border-subtle bg-surface-850 text-zinc-400 hover:border-border-hover'
                }`}
              >
                <div className="text-xs font-medium text-zinc-200">Member</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Can view, create & update tasks</div>
              </button>

              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setInviteLink(null); }}
                className={`p-3 rounded-lg border text-left transition ${
                  role === 'ADMIN'
                    ? 'border-accent/80 bg-accent/[0.08] text-white ring-1 ring-accent/30'
                    : 'border-border-subtle bg-surface-850 text-zinc-400 hover:border-border-hover'
                }`}
              >
                <div className="text-xs font-medium text-zinc-200 flex items-center space-x-1.5">
                  <span>Admin</span>
                  <Shield className="w-3 h-3 text-accent" />
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Manage boards, lists & members</div>
              </button>
            </div>
          </div>

          {!inviteLink ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs font-medium rounded-lg transition shadow-sm shadow-accent/20 flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Generating link...' : 'Generate invite link'}</span>
            </button>
          ) : (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-emerald-400">
                Active invite link (expires in 48 hours)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-surface-850 border border-border-subtle rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-lg border transition flex items-center justify-center ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-surface-850 hover:bg-white/[0.08] text-zinc-300 border-border-subtle'
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Single-use link powered by Redis token expiry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
