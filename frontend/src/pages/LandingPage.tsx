import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles, Plus, Radio, MoveRight } from 'lucide-react';

interface TaskItem {
  id: string;
  number: string;
  title: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  column: 'backlog' | 'in_progress' | 'done';
  assignee: string;
  assigneeInitials: string;
  time: string;
}

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Interactive Live Kanban Studio State
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'urgent'>('all');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [simulatedLiveEvent, setSimulatedLiveEvent] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: '104',
      number: '#104',
      title: 'Write OpenAPI / Swagger REST contract specification',
      priority: 'Low',
      column: 'backlog',
      assignee: 'Sarah Jenkins',
      assigneeInitials: 'SJ',
      time: 'Yesterday',
    },
    {
      id: '105',
      number: '#105',
      title: 'Configure Redis sliding-window rate limiting on auth endpoints',
      priority: 'Medium',
      column: 'backlog',
      assignee: 'Marcus Vance',
      assigneeInitials: 'MV',
      time: '2h ago',
    },
    {
      id: '108',
      number: '#108',
      title: 'Multi-stage Docker Compose production image optimization',
      priority: 'Low',
      column: 'backlog',
      assignee: 'Alex Chen',
      assigneeInitials: 'AC',
      time: '4h ago',
    },
    {
      id: '102',
      number: '#102',
      title: 'Socket.IO room subscription & broadcast mesh',
      priority: 'Urgent',
      column: 'in_progress',
      assignee: 'Alex Chen',
      assigneeInitials: 'AC',
      time: 'Just now',
    },
    {
      id: '103',
      number: '#103',
      title: 'Redis 48-hour single-use workspace invitation tokens',
      priority: 'High',
      column: 'in_progress',
      assignee: 'Marcus Vance',
      assigneeInitials: 'MV',
      time: '1h ago',
    },
    {
      id: '100',
      number: '#100',
      title: 'Prisma PostgreSQL relational schema migrations & foreign keys',
      priority: 'High',
      column: 'done',
      assignee: 'Alex Chen',
      assigneeInitials: 'AC',
      time: '1d ago',
    },
    {
      id: '101',
      number: '#101',
      title: 'JWT authentication with bcrypt password hashing pipeline',
      priority: 'Medium',
      column: 'done',
      assignee: 'Sarah Jenkins',
      assigneeInitials: 'SJ',
      time: '2d ago',
    },
    {
      id: '99',
      number: '#99',
      title: 'Multi-tenant organization role clearance tiers (Owner/Admin/Member)',
      priority: 'High',
      column: 'done',
      assignee: 'System Root',
      assigneeInitials: 'SR',
      time: '3d ago',
    },
  ]);

  // Interactive Departure Board State
  const [activeDispatchRow, setActiveDispatchRow] = useState<number>(2);

  // Interactive Code/Architecture Tab
  const [activeArchTab, setActiveArchTab] = useState<'socket' | 'redis' | 'prisma'>('socket');

  // Track scroll progress and trigger intersection observer reveals
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // IntersectionObserver for staggered scroll reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-scale');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleDemoClick = async () => {
    try {
      setIsDemoLoading(true);
      await demoLogin();
      navigate('/app');
    } catch (err) {
      console.error('Demo login failed:', err);
      navigate('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleSimulateMove = () => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === '102') {
          const nextCol = t.column === 'in_progress' ? 'done' : 'in_progress';
          return { ...t, column: nextCol };
        }
        return t;
      })
    );
    setSimulatedLiveEvent(
      'WebSocket event: task #102 updated across 3 active peer sockets in 11ms via Redis Pub/Sub'
    );
    setTimeout(() => {
      setSimulatedLiveEvent(null);
    }, 4500);
  };

  const dispatchRows = [
    {
      id: 0,
      event: 'task:moved',
      target: 'Card #102 → In Progress',
      author: 'Alex Chen',
      time: '12ms',
      status: 'SYNCED',
      detail: 'Broadcasted to room:board_49 via Redis Pub/Sub. 3 sockets acknowledged payload.',
    },
    {
      id: 1,
      event: 'invite:token_created',
      target: 'Workspace "Core Infra"',
      author: 'Sarah Jenkins',
      time: '4ms',
      status: 'COMMITTED',
      detail: 'Generated 32-byte cryptographic token. Written to Redis with EXPIRE 172800 (48h).',
    },
    {
      id: 2,
      event: 'presence:join',
      target: 'Marcus Vance joined sprint-34',
      author: 'Marcus Vance',
      time: '7ms',
      status: 'ONLINE',
      detail: 'Peer connected via WebSocket transport. Room member count incremented to 3.',
    },
    {
      id: 3,
      event: 'task:comment_added',
      target: 'PR #142 referenced in #104',
      author: 'Alex Chen',
      time: '18ms',
      status: 'PERSISTED',
      detail: 'Database transaction completed in PostgreSQL via Prisma. Notification emitted.',
    },
    {
      id: 4,
      event: 'workspace:role_granted',
      target: 'Clearance promoted to ADMIN',
      author: 'System Root',
      time: '9ms',
      status: 'VERIFIED',
      detail: 'Role-based access clearance cache invalidated. JWT claims refreshed.',
    },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'in_progress') return t.column === 'in_progress';
    if (activeFilter === 'urgent') return t.priority === 'Urgent';
    return true;
  });

  return (
    <div className="min-h-svh bg-graphite-bg text-graphite-ink font-jost selection:bg-graphite-orange selection:text-graphite-fieldInk p-2 sm:p-3 space-y-2">
      {/* Scroll Progress Bar at very top edge */}
      <div
        className="fixed top-0 left-0 h-1 bg-graphite-orange z-50 pointer-events-none transition-transform"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 1. TOP NAV BAR: FITTED TILES */}
      <nav className="grid grid-cols-12 gap-2 sticky top-2 z-40">
        <div className="col-span-3 sm:col-span-2 h-14 bg-graphite-surface rounded-lg flex items-center px-4">
          <Link to="/" className="font-jost text-lg font-bold tracking-tight text-graphite-ink">
            github.com/polkboban
          </Link>
        </div>

        <div className="col-span-5 sm:col-span-6 h-14 bg-graphite-surface rounded-lg flex items-center px-4 sm:px-8 space-x-6">
          <a href="#studio" className="text-xs sm:text-sm font-medium text-graphite-muted hover:text-graphite-ink transition">
            Live Studio
          </a>
          <a href="#showcase" className="text-xs sm:text-sm font-medium text-graphite-muted hover:text-graphite-ink transition">
            Dispatch Board
          </a>
          <a href="#engine" className="text-xs sm:text-sm font-medium text-graphite-muted hover:text-graphite-ink transition">
            Engine
          </a>
          <a href="#stats" className="text-xs sm:text-sm font-medium text-graphite-muted hover:text-graphite-ink transition">
            Metrics
          </a>
        </div>

        <div className="col-span-4 sm:col-span-4 h-14 flex items-center justify-end space-x-2">
          {user ? (
            <Link
              to="/app"
              className="h-14 px-5 bg-graphite-orange text-graphite-fieldInk font-bold text-xs sm:text-sm rounded-lg flex items-center space-x-2 hover:opacity-90 active:scale-[0.98] transition"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="h-14 px-4 bg-graphite-surface text-graphite-ink font-medium text-xs sm:text-sm rounded-lg hidden sm:flex items-center hover:bg-graphite-elevated transition"
              >
                Sign in
              </Link>
              <button
                onClick={handleDemoClick}
                disabled={isDemoLoading}
                className="h-14 px-4 sm:px-6 bg-graphite-orange text-graphite-fieldInk font-bold text-xs sm:text-sm rounded-lg flex items-center space-x-2 hover:opacity-90 active:scale-[0.98] transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDemoLoading ? 'Loading demo...' : 'Launch Demo'}</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO: TWO-BY-TWO BOARD BLUEPRINT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-2 pt-2">
        {/* Name Tile in Light Ground */}
        <div className="lg:col-span-6 bg-graphite-field text-graphite-fieldInk rounded-lg p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] scroll-reveal">
          <div>
            <span className="font-jost text-xs sm:text-sm font-bold tracking-normal">
              REAL-TIME COLLABORATION PLATFORM
            </span>
          </div>
          <div>
            <h1 className="font-jost text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter leading-none">
              <span className="text-graphite">TEAM</span>
              <span className="text-graphite-orange">SYNC</span>
            </h1>
          </div>
        </div>

        {/* Hero Interactive Mini Preview */}
        <div data-ui="hero-preview" className="lg:col-span-6 bg-graphite-surface rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[380px] sm:min-h-[440px] scroll-reveal">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-jost text-xl font-bold text-graphite-ink">Sprint 34 Dispatch</div>
              <div className="text-xs text-graphite-muted">3 active teammates online in room:board_34</div>
            </div>
            <div className="flex space-x-1.5">
              <span className="w-7 h-7 rounded bg-graphite-orange text-graphite-fieldInk text-xs font-bold flex items-center justify-center">AC</span>
              <span className="w-7 h-7 rounded bg-graphite-elevated text-graphite-ink text-xs font-bold flex items-center justify-center">SJ</span>
              <span className="w-7 h-7 rounded bg-graphite-elevated text-graphite-ink text-xs font-bold flex items-center justify-center">MV</span>
            </div>
          </div>

          <div className="space-y-2 py-4">
            <div className="p-3 rounded bg-graphite-bg flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-graphite-orange" />
                <span className="font-bold text-graphite-ink">#102 Socket.IO room broadcast mesh</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-graphite-surface text-graphite-orange font-bold text-[11px]">
                Urgent
              </span>
            </div>
            <div className="p-3 rounded bg-graphite-bg flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-graphite-muted" />
                <span className="text-graphite-ink">#103 Redis 48h single-use workspace invite tokens</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-graphite-surface text-graphite-muted font-bold text-[11px]">
                High
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <a href="#studio" className="font-jost font-bold text-graphite-orange hover:underline flex items-center space-x-1">
              <span>Inspect full live board below</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <span className="text-graphite-muted">11ms socket latency</span>
          </div>
        </div>

        {/* Bottom-Left: Large Statement Tile */}
        <div className="lg:col-span-6 bg-graphite-surface rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[200px] scroll-reveal">
          <p className="font-jost text-xl sm:text-3xl font-medium text-graphite-ink leading-tight">
            Zero polling. Sub-15 millisecond WebSocket synchronization across every connected peer.
          </p>
          <p className="text-xs sm:text-sm text-graphite-muted mt-4">
            Engineered with Redis Pub/Sub, Node.js, and PostgreSQL for teams that ship software continuously.
          </p>
        </div>

        {/* Bottom-Right Split: Spec Tile */}
        <div className="lg:col-span-3 bg-graphite-elevated rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[200px] scroll-reveal">
          <div className="font-jost text-lg font-bold text-graphite-ink">
            Multi-Tenant Workspaces
          </div>
          <div className="text-xs text-graphite-muted leading-relaxed">
            Role-based clearance tiers for Owner, Admin, and Member. Ephemeral 48-hour Redis invite tokens.
          </div>
        </div>

        {/* Bottom-Right Split: Action Tile */}
        <div
          onClick={handleDemoClick}
          className="lg:col-span-3 bg-graphite-orange text-graphite-fieldInk rounded-lg p-6 sm:p-8 flex flex-col justify-between min-h-[200px] cursor-pointer hover:opacity-95 active:scale-[0.98] transition scroll-reveal"
        >
          <div className="font-jost text-xs font-bold">
            1-CLICK DEMO
          </div>
          <div className="font-jost text-2xl font-bold leading-tight">
            Test the live board right now.
          </div>
          <div className="flex items-center justify-between font-jost font-bold text-xs sm:text-sm">
            <span>{isDemoLoading ? 'Starting demo...' : 'Instant access'}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 3. PRACTICAL & PLEASANT APP REPRESENTATION: FULL LIVE KANBAN STUDIO (data-ui) */}
      <section id="studio" className="pt-6 pb-2 scroll-scale">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between px-2 mb-3 gap-2">
          <div>
            <h2 className="font-jost text-2xl sm:text-4xl font-bold text-graphite-ink">
              Interactive Kanban Studio
            </h2>
            <p className="text-xs sm:text-sm text-graphite-muted mt-1">
              Click cards to inspect details, or trigger a simulated peer WebSocket mutation.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSimulateMove}
              className="px-4 py-2 bg-graphite-elevated hover:bg-graphite-surface text-graphite-ink rounded font-jost font-bold text-xs flex items-center space-x-1.5 transition active:scale-[0.97]"
            >
              <Radio className="w-3.5 h-3.5 text-graphite-orange" />
              <span>Simulate Peer Drag (#102)</span>
            </button>
            <button
              onClick={handleDemoClick}
              disabled={isDemoLoading}
              className="px-4 py-2 bg-graphite-orange text-graphite-fieldInk rounded font-jost font-bold text-xs flex items-center space-x-1.5 hover:opacity-90 transition active:scale-[0.97]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open in Full App</span>
            </button>
          </div>
        </div>

        {/* Live Studio Frame */}
        <div data-ui="app-studio" className="bg-graphite-surface rounded-lg p-4 sm:p-6 space-y-4">
          {/* Studio Window Chrome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-xs font-bold text-graphite-ink">
                Acme Engineering / Core Sprint 34
              </span>
            </div>

            {/* Filter pills & Real-time Indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-graphite-bg rounded p-0.5 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded transition ${activeFilter === 'all' ? 'bg-graphite-surface text-graphite-ink font-bold' : 'text-graphite-muted'}`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveFilter('in_progress')}
                  className={`px-2.5 py-1 rounded transition ${activeFilter === 'in_progress' ? 'bg-graphite-surface text-graphite-ink font-bold' : 'text-graphite-muted'}`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setActiveFilter('urgent')}
                  className={`px-2.5 py-1 rounded transition ${activeFilter === 'urgent' ? 'bg-graphite-surface text-graphite-ink font-bold' : 'text-graphite-muted'}`}
                >
                  Urgent
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-graphite-bg text-[11px] text-graphite-orange font-bold">
                <span className="w-2 h-2 rounded-full bg-graphite-orange" />
                <span>Socket Connected (11ms)</span>
              </div>
            </div>
          </div>

          {/* Simulated Toast Notification */}
          {simulatedLiveEvent && (
            <div className="p-3 bg-graphite-orange text-graphite-fieldInk rounded text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
              <span>{simulatedLiveEvent}</span>
              <span className="text-[10px] bg-graphite-fieldInk text-graphite-field px-1.5 py-0.5 rounded">
                BROADCAST CONFIRMED
              </span>
            </div>
          )}

          {/* 3 Full Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Column 1: Backlog */}
            <div className="bg-graphite-bg rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-graphite-ink">Backlog</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-graphite-surface text-graphite-muted font-bold">
                    {filteredTasks.filter((t) => t.column === 'backlog').length}
                  </span>
                </div>
                <button className="text-graphite-muted hover:text-graphite-ink p-1">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredTasks
                  .filter((t) => t.column === 'backlog')
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-lg bg-graphite-surface hover:bg-graphite-elevated cursor-pointer transition ${selectedTask?.id === task.id ? 'ring-2 ring-graphite-orange' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-graphite-muted">{task.number}</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-elevated text-graphite-muted font-bold text-[10px]">
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-graphite-ink leading-snug">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-graphite-muted">
                        <span>{task.time}</span>
                        <span className="w-5 h-5 rounded bg-graphite-elevated text-graphite-ink flex items-center justify-center font-bold text-[9px]">
                          {task.assigneeInitials}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-graphite-bg rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-graphite-orange">In Progress</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-graphite-orange text-graphite-fieldInk font-bold">
                    {filteredTasks.filter((t) => t.column === 'in_progress').length}
                  </span>
                </div>
                <button className="text-graphite-muted hover:text-graphite-ink p-1">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {filteredTasks
                  .filter((t) => t.column === 'in_progress')
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-lg bg-graphite-elevated cursor-pointer transition ${selectedTask?.id === task.id ? 'ring-2 ring-graphite-orange' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-graphite-orange">{task.number}</span>
                        <span className="px-1.5 py-0.5 rounded bg-graphite-surface text-graphite-orange font-bold text-[10px]">
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-graphite-ink leading-snug">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-graphite-muted">
                        <span className="text-graphite-orange font-bold">Active socket stream</span>
                        <span className="w-5 h-5 rounded bg-graphite-orange text-graphite-fieldInk flex items-center justify-center font-bold text-[9px]">
                          {task.assigneeInitials}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 3: Shipped / Done */}
            <div className="bg-graphite-bg rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-graphite-muted">Shipped</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-graphite-surface text-graphite-muted font-bold">
                    {filteredTasks.filter((t) => t.column === 'done').length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {filteredTasks
                  .filter((t) => t.column === 'done')
                  .map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-lg bg-graphite-surface cursor-pointer opacity-80 hover:opacity-100 transition ${selectedTask?.id === task.id ? 'ring-2 ring-graphite-orange' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-graphite-muted">{task.number}</span>
                        <span className="text-[10px] text-graphite-muted">Completed</span>
                      </div>
                      <div className="text-xs text-graphite-muted line-through leading-snug">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-graphite-muted">
                        <span>{task.time}</span>
                        <span className="w-5 h-5 rounded bg-graphite-elevated text-graphite-muted flex items-center justify-center font-bold text-[9px]">
                          {task.assigneeInitials}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Selected Task Inspection Drawer (Shows when clicked) */}
          {selectedTask && (
            <div className="p-4 rounded-lg bg-graphite-bg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="space-y-0.5">
                <div className="font-bold text-graphite-ink flex items-center space-x-2">
                  <span className="text-graphite-orange">{selectedTask.number}</span>
                  <span>{selectedTask.title}</span>
                </div>
                <div className="text-graphite-muted text-[11px]">
                  Assigned to {selectedTask.assignee} · Priority: {selectedTask.priority} · State: {selectedTask.column}
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-3 py-1.5 rounded bg-graphite-surface text-graphite-muted hover:text-graphite-ink"
                >
                  Close
                </button>
                <button
                  onClick={handleDemoClick}
                  className="px-3 py-1.5 rounded bg-graphite-orange text-graphite-fieldInk font-bold flex items-center space-x-1"
                >
                  <span>Edit in Demo</span>
                  <MoveRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SHOWCASE: ROWS AS A DEPARTURE BOARD BLUEPRINT */}
      <section id="showcase" className="pt-8 pb-4 scroll-reveal">
        <h2 className="font-jost text-2xl sm:text-4xl font-bold text-graphite-ink mb-3 px-2">
          Live socket dispatch board
        </h2>

        <div data-ui="dispatch-board" className="space-y-1.5">
          {dispatchRows.map((row) => {
            const isOpen = activeDispatchRow === row.id;
            return (
              <div
                key={row.id}
                onClick={() => setActiveDispatchRow(row.id)}
                className={`rounded-lg p-4 sm:p-5 transition cursor-pointer ${
                  isOpen
                    ? 'bg-graphite-orange text-graphite-fieldInk min-h-[160px] flex flex-col justify-between'
                    : 'bg-graphite-surface text-graphite-ink hover:bg-graphite-elevated h-16 sm:h-18 flex items-center justify-between'
                }`}
              >
                {isOpen ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-jost font-bold text-sm tracking-normal">
                        EVENT: {row.event}
                      </span>
                      <span className="text-xs font-bold bg-graphite-fieldInk text-graphite-field px-2 py-1 rounded">
                        LATENCY: {row.time}
                      </span>
                    </div>
                    <div>
                      <div className="font-jost text-xl sm:text-2xl font-bold leading-snug">
                        {row.target}
                      </div>
                      <div className="text-xs mt-1 opacity-90">{row.detail}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold pt-2">
                      <span>DISPATCHED BY: {row.author}</span>
                      <span>STATUS: {row.status}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-4 sm:space-x-8 truncate">
                      <span className="font-jost text-xs sm:text-sm font-bold text-graphite-orange shrink-0">
                        {row.event}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-graphite-ink truncate">
                        {row.target}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 shrink-0 text-xs">
                      <span className="text-graphite-muted hidden sm:inline">{row.author}</span>
                      <span className="text-graphite-muted">{row.time}</span>
                      <span className="px-2 py-0.5 rounded bg-graphite-bg text-graphite-muted font-bold text-[11px]">
                        {row.status}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS: TILES THAT GROW BLUEPRINT */}
      <section id="engine" className="pt-8 pb-4 scroll-reveal">
        <h2 className="font-jost text-2xl sm:text-4xl font-bold text-graphite-ink mb-4 px-2">
          How the engine syncs.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          {/* Tile 1: Connect */}
          <div className="md:col-span-3 bg-graphite-surface rounded-lg p-6 flex flex-col justify-between h-[200px] scroll-scale">
            <div className="font-jost text-xl font-bold text-graphite-ink">
              Connect
            </div>
            <div className="text-xs text-graphite-muted leading-relaxed">
              Client establishes bidirectional WebSocket handshake. JWT verified and connection pinned to workspace room.
            </div>
          </div>

          {/* Tile 2: Mutate */}
          <div className="md:col-span-4 bg-graphite-elevated rounded-lg p-6 flex flex-col justify-between h-[280px] scroll-scale">
            <div className="font-jost text-2xl font-bold text-graphite-ink">
              Mutate
            </div>
            <div className="text-xs text-graphite-muted leading-relaxed">
              Teammate drags a card. TanStack Query applies an optimistic state transition instantly in the DOM with automated rollback protection.
            </div>
          </div>

          {/* Tile 3: Broadcast */}
          <div className="md:col-span-5 bg-graphite-orange text-graphite-fieldInk rounded-lg p-8 flex flex-col justify-between h-[360px] scroll-scale">
            <div className="font-jost text-4xl font-bold leading-tight">
              Broadcast
            </div>
            <div className="text-sm font-medium leading-relaxed">
              Express commits mutation to PostgreSQL via Prisma ORM and sends the event payload to Redis. Redis Pub/Sub fans out the update to all active workspace peers in under 15 milliseconds.
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRACTICAL DEEP-DIVE: INTERACTIVE ARCHITECTURE INSPECTOR */}
      <section className="pt-8 pb-4 scroll-reveal">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 mb-3 gap-2">
          <div>
            <h2 className="font-jost text-2xl sm:text-3xl font-bold text-graphite-ink">
              System Architecture Inspector
            </h2>
            <p className="text-xs text-graphite-muted">
              Inspect the real backend implementation wiring client, socket mesh, and database.
            </p>
          </div>
          <div className="flex space-x-1 bg-graphite-surface rounded p-1">
            <button
              onClick={() => setActiveArchTab('socket')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeArchTab === 'socket' ? 'bg-graphite-orange text-graphite-fieldInk' : 'text-graphite-muted hover:text-graphite-ink'}`}
            >
              Socket Mesh
            </button>
            <button
              onClick={() => setActiveArchTab('redis')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeArchTab === 'redis' ? 'bg-graphite-orange text-graphite-fieldInk' : 'text-graphite-muted hover:text-graphite-ink'}`}
            >
              Redis TTL
            </button>
            <button
              onClick={() => setActiveArchTab('prisma')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${activeArchTab === 'prisma' ? 'bg-graphite-orange text-graphite-fieldInk' : 'text-graphite-muted hover:text-graphite-ink'}`}
            >
              PostgreSQL Prisma
            </button>
          </div>
        </div>

        <div className="bg-graphite-surface rounded-lg p-6 overflow-x-auto text-xs">
          {activeArchTab === 'socket' && (
            <pre className="font-mono text-graphite-ink leading-relaxed">
              <code>
                {`// ts-backend/src/socket.ts - Low-latency broadcast mesh
io.on('connection', (socket) => {
  socket.on('join_board', (boardId) => {
    socket.join(\`board:\${boardId}\`);
    // Broadcast peer presence to all connected sockets in room
    socket.to(\`board:\${boardId}\`).emit('user_joined', socket.user);
  });

  socket.on('task_move', async (data) => {
    // Zero-polling event dispatch via Redis Pub/Sub
    socket.to(\`board:\${data.boardId}\`).emit('task_moved', data);
  });
});`}
              </code>
            </pre>
          )}

          {activeArchTab === 'redis' && (
            <pre className="font-mono text-graphite-ink leading-relaxed">
              <code>
                {`// ts-backend/src/services/workspace.service.ts - Ephemeral tokens
const token = crypto.randomBytes(32).toString('hex');
const payload = JSON.stringify({ workspaceId, role });

// Atomic Redis set with strict 48-hour expiration (172,800 seconds)
await redis.set(\`invite:\${token}\`, payload, 'EX', 172800);

// Atomic verification & single-use consumption
const data = await redis.getdel(\`invite:\${token}\`);`}
              </code>
            </pre>
          )}

          {activeArchTab === 'prisma' && (
            <pre className="font-mono text-graphite-ink leading-relaxed">
              <code>
                {`// prisma/schema.prisma - Multi-tenant relational model
model Workspace {
  id          String            @id @default(uuid())
  name        String
  members     WorkspaceMember[]
  boards      Board[]
}

model Task {
  id          String            @id @default(uuid())
  title       String
  order       Int
  listId      String
  list        List              @relation(fields: [listId], references: [id])
}`}
              </code>
            </pre>
          )}
        </div>
      </section>

      {/* 7. FEATURES: STATEMENT CELL, DARK ROWS BLUEPRINT */}
      <section className="pt-8 pb-4 scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left: Statement Cell in Light Ground */}
          <div className="lg:col-span-6 bg-graphite-field text-graphite-fieldInk rounded-lg p-8 sm:p-12 flex flex-col justify-between min-h-[460px]">
            <div>
              <h2 className="font-jost text-5xl sm:text-7xl font-bold tracking-tight leading-none">
                BUILT FOR SPEED
              </h2>
            </div>
            <div>
              <p className="font-jost text-base sm:text-lg leading-relaxed text-graphite-fieldInk font-medium max-w-md">
                TeamSync eliminates coordination lag. No stale browser tabs, no missing context, and no synchronization collisions.
              </p>
              <button
                onClick={handleDemoClick}
                disabled={isDemoLoading}
                className="mt-6 px-6 py-3 bg-graphite-fieldInk text-graphite-field font-jost font-bold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition"
              >
                Launch Demo Workspace
              </button>
            </div>
          </div>

          {/* Right: Dark Stacked Rows */}
          <div className="lg:col-span-6 flex flex-col space-y-2">
            {[
              {
                title: 'Multi-Tenant Workspaces',
                desc: 'Clean organization-level tenant isolation with Owner, Admin, and Member permission tiers.',
              },
              {
                title: 'Redis Ephemeral Invitations',
                desc: 'Single-use cryptographic invite links with exact 48-hour TTL that self-destruct upon redemption.',
              },
              {
                title: 'Optimistic UI with Rollback',
                desc: 'Sub-second UI responsiveness during drag and drop with automatic cache rollback on network drops.',
              },
              {
                title: 'PostgreSQL & Prisma ORM',
                desc: 'ACID transactional data integrity, schema foreign keys, and database connection pooling.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg flex flex-col justify-between flex-1 ${
                  idx % 2 === 0 ? 'bg-graphite-surface' : 'bg-graphite-elevated'
                }`}
              >
                <div className="font-jost text-lg font-bold text-graphite-ink">{feature.title}</div>
                <div className="text-xs text-graphite-muted leading-relaxed mt-1">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. STATS: STEPPED FIGURE TILES BLUEPRINT */}
      <section id="stats" className="pt-8 pb-4 scroll-reveal">
        <h2 className="font-jost text-2xl sm:text-4xl font-bold text-graphite-ink mb-4 px-2">
          Measured performance.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Tile 1: Tall Orange Tile */}
          <div className="md:col-span-4 bg-graphite-orange text-graphite-fieldInk rounded-lg p-8 flex flex-col justify-between h-[340px] scroll-scale">
            <div className="font-jost text-6xl sm:text-7xl font-bold leading-none">&lt;15ms</div>
            <div className="font-jost text-sm font-bold">
              Socket.IO WebSocket broadcast latency
            </div>
          </div>

          {/* Tile 2: Lower Surface Tile */}
          <div className="md:col-span-4 bg-graphite-surface rounded-lg p-8 flex flex-col justify-between h-[280px] md:mt-12 scroll-scale">
            <div className="font-jost text-5xl sm:text-6xl font-bold text-graphite-ink leading-none">48 hrs</div>
            <div className="font-jost text-sm text-graphite-muted">
              Redis invite token automatic expiration
            </div>
          </div>

          {/* Tile 3: Lowest Elevated Tile */}
          <div className="md:col-span-4 bg-graphite-elevated rounded-lg p-8 flex flex-col justify-between h-[220px] md:mt-24 scroll-scale">
            <div className="font-jost text-4xl sm:text-5xl font-bold text-graphite-ink leading-none">100%</div>
            <div className="font-jost text-sm text-graphite-muted">
              TypeScript strict type coverage
            </div>
          </div>
        </div>
      </section>

      {/* 9. ACTION TILE CLOSE (CTA) BLUEPRINT */}
      <section className="pt-8 pb-4 scroll-reveal">
        <div className="grid grid-cols-12 gap-2">
          <div className="hidden lg:block lg:col-span-2 bg-graphite-elevated rounded-lg min-h-[240px]" />

          <div className="col-span-12 lg:col-span-8 bg-graphite-orange text-graphite-fieldInk rounded-lg p-8 sm:p-12 flex flex-col justify-between min-h-[240px]">
            <div>
              <h2 className="font-jost text-3xl sm:text-5xl font-bold tracking-tight">
                Ready to collaborate?
              </h2>
              <p className="font-jost text-sm sm:text-base font-medium max-w-lg mt-2 opacity-95">
                Launch a live demo workspace in one click. Pre-seeded with sprint tasks and simulated peers.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDemoClick}
                disabled={isDemoLoading}
                className="px-6 py-3 bg-graphite-fieldInk text-graphite-field font-jost font-bold text-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition flex items-center space-x-2"
              >
                <span>{isDemoLoading ? 'Launching demo...' : 'Try Demo Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/register"
                className="px-5 py-3 font-jost font-bold text-xs sm:text-sm text-graphite-fieldInk hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2 bg-graphite-surface rounded-lg min-h-[240px]" />
        </div>
      </section>

      {/* 10. FOOTER: DESIGNED CLOSE */}
      <footer className="pt-6 pb-4">
        <div className="bg-graphite-surface rounded-lg p-8 sm:p-12 flex flex-col justify-between min-h-[200px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-jost text-4xl sm:text-6xl font-bold tracking-tighter text-graphite-ink">
              TEAMSYNC
            </span>
            <div className="flex items-center space-x-2 text-xs font-bold text-graphite-muted">
              <span className="w-2 h-2 rounded-full bg-graphite-orange" />
              <span>All systems operational · PostgreSQL, Redis, Socket.IO, Node.js</span>
            </div>
          </div>

          <div className="pt-8 text-xs text-graphite-muted flex flex-col sm:flex-row justify-between gap-2">
            <span>Production collaboration architecture for engineering teams.</span>
            <span>MIT License · TeamSync Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
