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
      setError(err.response?.data?.error || 'FAILED TO GENERATE INVITE TOKEN');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-carbon-900 border border-carbon-750 w-full max-w-md p-6 shadow-2xl relative font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <UserPlus className="w-4 h-4" />
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              DISPATCH ACCESS INVITE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-carbon-400 mt-3 leading-relaxed uppercase">
          GENERATE REDIS-BACKED 48-HOUR SINGLE-USE ACCESS TOKEN FOR <span className="text-white font-semibold">{workspaceName}</span>.
        </p>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-950/30 border border-rose-800/80 text-[11px] text-rose-300 uppercase">
            // ERR: {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-carbon-400 mb-1.5">
              CLEARANCE LEVEL / ROLE
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setRole('MEMBER'); setInviteLink(null); }}
                className={`p-2.5 border text-left transition ${
                  role === 'MEMBER'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-200'
                    : 'border-carbon-750 bg-carbon-850/50 text-carbon-400 hover:border-carbon-600'
                }`}
              >
                <div className="text-xs font-bold uppercase">MEMBER</div>
                <div className="text-[9px] text-carbon-500 mt-0.5 uppercase">TASK EDIT ACCESS</div>
              </button>

              <button
                type="button"
                onClick={() => { setRole('ADMIN'); setInviteLink(null); }}
                className={`p-2.5 border text-left transition ${
                  role === 'ADMIN'
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-200'
                    : 'border-carbon-750 bg-carbon-850/50 text-carbon-400 hover:border-carbon-600'
                }`}
              >
                <div className="text-xs font-bold uppercase flex items-center space-x-1">
                  <span>ADMIN</span>
                  <Shield className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-[9px] text-carbon-500 mt-0.5 uppercase">OPERATOR & LANE MGMT</div>
              </button>
            </div>
          </div>

          {!inviteLink ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-carbon-950 text-xs font-bold uppercase tracking-wider transition shadow-glow-cyan flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'GENERATING TOKEN...' : 'GENERATE DISPATCH TOKEN'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                ACTIVE ACCESS TOKEN LINK (EXPIRES IN 48H)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 bg-carbon-850 border border-carbon-750 px-3 py-2 text-[11px] text-cyan-300 font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className={`p-2 border transition flex items-center justify-center ${
                    copied
                      ? 'bg-emerald-600 text-carbon-950 border-emerald-500'
                      : 'bg-carbon-850 hover:bg-carbon-800 text-carbon-200 border-carbon-750'
                  }`}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
