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
      setError(err.response?.data?.error || 'FAILED TO INITIALIZE WORKSPACE');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-carbon-900 border border-carbon-750 w-full max-w-md p-6 shadow-2xl relative font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Layers className="w-4 h-4" />
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-white">
              INITIALIZE WORKSPACE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-carbon-800 text-carbon-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-950/30 border border-rose-800/80 text-[11px] text-rose-300 uppercase">
            // ERR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-carbon-400 mb-1">
              WORKSPACE NAME
            </label>
            <input
              type="text"
              placeholder="E.G. CORE INFRASTRUCTURE TEAM"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-carbon-850 border border-carbon-750 px-3 py-2 text-xs text-white placeholder-carbon-600 focus:outline-none focus:border-cyan-500 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-carbon-400 mb-1">
              MISSION SPECIFICATION (OPTIONAL)
            </label>
            <textarea
              placeholder="Scope and purpose of this workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-carbon-850 border border-carbon-750 px-3 py-2 text-xs text-white placeholder-carbon-600 focus:outline-none focus:border-cyan-500 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-mono text-carbon-400 hover:text-white transition uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-carbon-950 transition"
            >
              {isLoading ? 'INITIALIZING...' : '+ CONFIRM WORKSPACE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
