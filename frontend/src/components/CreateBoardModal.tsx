import React, { useState } from 'react';
import { X, Kanban } from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(title.trim());
      setTitle('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-surface-900 border border-border-subtle rounded-xl w-full max-w-sm p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-border-subtle flex items-center justify-center text-zinc-300">
              <Kanban className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Create Board
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
              Board title
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint 24, Product Roadmap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full bg-surface-850 border border-border-subtle focus:border-accent rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none transition"
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
              disabled={isLoading || !title.trim()}
              className="px-3.5 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg transition shadow-sm shadow-accent/20"
            >
              {isLoading ? 'Creating...' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
