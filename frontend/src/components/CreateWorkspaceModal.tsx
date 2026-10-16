import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string) => Promise<void>;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-surface-900 border border-border-subtle rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-border-subtle flex items-center justify-center text-zinc-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Create Workspace
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

        {error && (
          <div className="mt-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Workspace name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-surface-850 border border-border-subtle focus:border-accent rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-surface-850 border border-border-subtle focus:border-accent rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none transition"
            />
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-3.5 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg transition shadow-sm shadow-accent/20"
            >
              {isLoading ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
