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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 font-jost">
      <div
        data-ui="modal"
        className="bg-graphite-surface rounded-xl w-full max-w-sm p-6 relative border border-graphite-bg"
      >
        <div data-ui="modal-header" className="flex items-center justify-between pb-3 border-b border-graphite-bg">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-graphite-bg flex items-center justify-center text-graphite-orange">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-graphite-ink tracking-tight">
                Create Board
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

        {error && (
          <div className="mt-4 p-3 bg-rose-950/40 text-rose-300 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-graphite-muted mb-1.5 uppercase">
              Board title
            </label>
            <input
              type="text"
              placeholder="e.g. Sprint 35, Core Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full bg-graphite-bg text-graphite-ink rounded-lg px-4 py-2.5 text-xs placeholder-graphite-muted focus:outline-none focus:ring-2 focus:ring-graphite-orange transition"
            />
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2.5 text-xs font-bold bg-graphite-orange hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-graphite-fieldInk rounded-lg transition"
            >
              {isLoading ? 'Creating...' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
