import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Kanban,
  Search,
  Palette,
  Sparkles
} from 'lucide-react';

interface GettingStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  description: string;
  tips: string[];
  actionLabel?: string;
  actionRoute?: string;
}

export const GettingStartedModal: React.FC<GettingStartedModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      title: 'Workspaces Come First',
      subtitle: 'The foundational container for your team',
      icon: <Layers className="w-6 h-6 text-graphite-orange" />,
      badge: 'Step 1 of 4',
      description:
        'In TeamSync, everything lives inside a Workspace. Before creating boards and tasks, make sure you have an active workspace for your team or organization.',
      tips: [
        'Organize multiple teams or clients into separate workspaces',
        'Invite teammates directly using secure, shareable invite links',
        'Access the full directory anytime from the "Workspaces" tab in the navbar',
      ],
      actionLabel: 'View Workspaces Directory',
      actionRoute: '/app/workspaces',
    },
    {
      title: 'Kanban Boards & Multiplayer Presence',
      subtitle: 'Real-time distributed collaboration',
      icon: <Kanban className="w-6 h-6 text-graphite-orange" />,
      badge: 'Step 2 of 4',
      description:
        'Sprint boards organize tasks across workflow lists (Backlog, In Progress, Review, Done). TeamSync relays drag updates and live peer ghost chips over WebSockets.',
      tips: [
        'Drag and drop cards across columns; teammate cursors display live ghost badges',
        'Click any task to inspect details, add subtasks, and chat in comment threads',
        'Real-time typing indicators show when a peer is writing a comment',
      ],
      actionLabel: 'Explore Demo Board',
      actionRoute: '/app',
    },
    {
      title: 'Universal Command Palette',
      subtitle: 'Navigate at the speed of thought',
      icon: <Search className="w-6 h-6 text-graphite-orange" />,
      badge: 'Step 3 of 4',
      description:
        'Press Ctrl+K (or ⌘K on macOS) from anywhere in TeamSync to instantly search tasks, jump across boards, switch views, or inspect assignments.',
      tips: [
        'Press Ctrl+K / ⌘K or tap the search pill in the navbar',
        'Use Arrow Up / Down keys to navigate results and Enter to select',
        'Press ESC at any time to instantly dismiss the palette',
      ],
    },
    {
      title: 'Personalize Your Theme & Accent Color',
      subtitle: 'Tailor TeamSync to your visual aesthetic',
      icon: <Palette className="w-6 h-6 text-graphite-orange" />,
      badge: 'Step 4 of 4',
      description:
        'Love the safety orange or want electric cyan? Visit the dedicated Settings page to change accent themes or specify your own custom hex color.',
      tips: [
        'Choose from curated presets (Safety Orange, Cyber Cyan, Signal Emerald, etc.)',
        'Use the custom hex color picker to match your brand',
        'All badges, buttons, and drag indicators instantly adapt',
      ],
      actionLabel: 'Open Settings Page',
      actionRoute: '/app/settings',
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('teamsync_tutorial_completed', 'true');
    onClose();
  };

  const handleStepAction = (route?: string) => {
    handleComplete();
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 font-jost select-none">
      <div
        data-ui="tutorial-modal"
        className="w-full max-w-xl bg-graphite-surface rounded-2xl border border-graphite-elevated overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div data-ui="modal-header" className="p-4 sm:p-6 bg-graphite-elevated/40 border-b border-graphite-bg flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-graphite-bg text-graphite-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-graphite-orange uppercase tracking-wider block">
                Quick Start Guide
              </span>
              <h2 className="text-base sm:text-lg font-bold text-graphite-ink">
                Welcome to TeamSync
              </h2>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="p-2 rounded-lg text-graphite-muted hover:text-graphite-ink hover:bg-graphite-bg transition"
            title="Close tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
          {/* Badge & Step indicator */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-graphite-orange bg-graphite-bg px-2.5 py-1 rounded">
              {current.badge}
            </span>

            {/* Dots */}
            <div className="flex items-center space-x-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-transform ${
                    idx === currentStep
                      ? 'w-6 bg-graphite-orange'
                      : 'w-1.5 bg-graphite-elevated hover:bg-graphite-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Title & Icon */}
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-graphite-bg flex items-center justify-center shrink-0 border border-graphite-elevated">
              {current.icon}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-graphite-ink tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-graphite-muted font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Body Description */}
          <p className="text-xs sm:text-sm text-graphite-ink/90 leading-relaxed bg-graphite-bg/50 p-3.5 rounded-xl border border-graphite-bg">
            {current.description}
          </p>

          {/* Key Tips Bullet Points */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-graphite-muted uppercase tracking-wider block">
              Key Workflow Tips
            </span>
            <div className="space-y-1.5">
              {current.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2 text-xs sm:text-sm text-graphite-ink"
                >
                  <CheckCircle2 className="w-4 h-4 text-graphite-orange shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Action Button (if any) */}
          {current.actionLabel && (
            <div className="pt-2">
              <button
                onClick={() => handleStepAction(current.actionRoute)}
                className="w-full sm:w-auto px-4 py-2 bg-graphite-bg hover:bg-graphite-elevated text-graphite-orange text-xs font-bold rounded-lg border border-graphite-elevated flex items-center justify-center space-x-2 transition"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div data-ui="modal-footer" className="p-4 sm:p-5 bg-graphite-bg border-t border-graphite-bg flex items-center justify-between gap-3">
          <button
            onClick={handleComplete}
            className="text-xs font-bold text-graphite-muted hover:text-graphite-ink transition px-2 py-1"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 bg-graphite-surface hover:bg-graphite-elevated text-graphite-ink text-xs font-bold rounded-lg transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-graphite-orange text-graphite-fieldInk text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition flex items-center space-x-1.5"
            >
              <span>{currentStep === steps.length - 1 ? "Let's Get Started" : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
