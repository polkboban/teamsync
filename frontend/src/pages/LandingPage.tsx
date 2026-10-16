import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Database,
  Cpu,
  GitBranch,
  Server,
  Clock,
  Activity,
  Code2,
  Check,
  ChevronRight,
  Kanban,
  Radio
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [activeArchTab, setActiveArchTab] = useState<'socket' | 'redis' | 'prisma'>('socket');

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

  return (
    <div className="min-h-screen bg-canvas text-zinc-100 font-sans selection:bg-accent selection:text-white relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-accent/[0.08] blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-canvas/80 border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-white shadow-sm shadow-accent/20">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">
                TeamSync
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-zinc-400 font-mono">
                v1.0
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-5 text-xs text-zinc-400">
              <a href="#features" className="hover:text-zinc-200 transition">
                Features
              </a>
              <a href="#mockup" className="hover:text-zinc-200 transition">
                Live Preview
              </a>
              <a href="#architecture" className="hover:text-zinc-200 transition">
                Architecture
              </a>
              <a href="#stack" className="hover:text-zinc-200 transition">
                Tech Stack
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to="/app"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition shadow-sm shadow-accent/25"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition"
                >
                  Sign in
                </Link>
                <button
                  onClick={handleDemoClick}
                  disabled={isDemoLoading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] border border-border-subtle hover:border-border-hover text-zinc-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>{isDemoLoading ? 'Loading demo...' : 'Try Demo'}</span>
                </button>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent-hover text-white transition shadow-sm shadow-accent/25"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-20 max-w-5xl mx-auto px-4 text-center">
        {/* Real-time status badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-900 border border-border-subtle text-xs text-zinc-300 shadow-sm mb-6 animate-in fade-in duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-[11px] sm:text-xs">
            WebSocket Engine Active · Sub-15ms Sync
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-[11px] text-zinc-400 font-mono">Redis 7 Pub/Sub</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.12]">
          Real-time collaboration,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
            engineered for speed.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A production-grade collaboration platform built with TypeScript, Node.js, PostgreSQL, and Redis.
          Experience drag-and-drop Kanban boards, live presence, and multi-tenant workspaces.
        </p>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDemoClick}
            disabled={isDemoLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-accent hover:bg-accent-hover text-white transition shadow-lg shadow-accent/25 hover:shadow-accent/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDemoLoading ? 'Launching demo workspace...' : 'Launch Instant Demo (1-Click)'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-surface-900 hover:bg-surface-850 border border-border-subtle hover:border-border-hover text-zinc-300 transition"
          >
            <span>Create Free Account</span>
          </Link>
        </div>

        <p className="mt-3 text-[11px] text-zinc-500">
          Zero setup required · Pre-seeded demo tasks & presence
        </p>
      </section>

      {/* Hero Interactive Mockup Showcase */}
      <section id="mockup" className="max-w-5xl mx-auto px-4 pb-20">
        <div className="relative rounded-xl border border-border-subtle bg-surface-900/90 shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Top Window Chrome */}
          <div className="h-10 px-4 bg-surface-850 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-[11px] font-mono text-zinc-400">
                teamsync.internal / workspace-production / sprint-34
              </span>
            </div>

            {/* Simulated Live Avatars */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-zinc-400 hidden sm:inline">3 online</span>
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 border border-surface-850 text-[9px] font-bold flex items-center justify-center text-white" title="Alex Chen (Lead)">
                  AC
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-600 border border-surface-850 text-[9px] font-bold flex items-center justify-center text-white" title="Sarah Jenkins (Frontend)">
                  SJ
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-600 border border-surface-850 text-[9px] font-bold flex items-center justify-center text-white" title="Marcus Vance (DevOps)">
                  MV
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Board Container Preview */}
          <div className="p-4 sm:p-6 bg-surface-950/70 overflow-x-auto">
            <div className="flex items-start space-x-4 min-w-[760px]">
              {/* Column 1: Backlog */}
              <div className="w-64 shrink-0 bg-surface-900 border border-border-subtle rounded-lg p-3">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-subtle">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-zinc-200">Backlog</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/[0.05] text-[10px] font-mono text-zinc-400">
                      2
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-md hover:border-border-hover transition group">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>#104</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px]">
                        Low
                      </span>
                    </div>
                    <div className="text-xs text-zinc-200 font-medium leading-snug">
                      Write OpenAPI / Swagger route specifications
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-md hover:border-border-hover transition group">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>#105</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[9px]">
                        Medium
                      </span>
                    </div>
                    <div className="text-xs text-zinc-200 font-medium leading-snug">
                      Configure Redis sliding-window rate limiter
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="w-64 shrink-0 bg-surface-900 border border-border-subtle rounded-lg p-3">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-subtle">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-zinc-200">In Progress</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-accent/15 text-[10px] font-mono text-accent">
                      2
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-surface-850 border border-accent/40 rounded-md ring-1 ring-accent/20 transition">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-accent">#102</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[9px]">
                        Urgent
                      </span>
                    </div>
                    <div className="text-xs text-zinc-100 font-medium leading-snug">
                      Implement Socket.IO room subscriptions & optimistic reordering
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle text-[10px] text-zinc-400">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>Syncing</span>
                      </span>
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-[8px] font-bold flex items-center justify-center text-white">
                        AC
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-md hover:border-border-hover transition">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>#103</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[9px]">
                        High
                      </span>
                    </div>
                    <div className="text-xs text-zinc-200 font-medium leading-snug">
                      Redis key expiry for single-use workspace invite tokens
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Completed */}
              <div className="w-64 shrink-0 bg-surface-900 border border-border-subtle rounded-lg p-3">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-subtle">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-zinc-200">Done</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-[10px] font-mono text-emerald-400">
                      3
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-md opacity-75">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>#100</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-xs text-zinc-400 line-through">
                      Prisma schema migration & PostgreSQL indexing
                    </div>
                  </div>

                  <div className="p-2.5 bg-surface-850 border border-border-subtle rounded-md opacity-75">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-1">
                      <span>#101</span>
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="text-xs text-zinc-400 line-through">
                      JWT authentication flow with bcrypt password hashing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Event Dispatch Ticker Bar */}
          <div className="h-8 px-4 bg-surface-900 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <div className="flex items-center space-x-2 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-500">[19:28:40]</span>
              <span className="text-indigo-400">redis_pubsub</span>
              <span className="text-zinc-600">→</span>
              <span className="text-zinc-300 truncate">event: 'task:moved' broadcasted to 3 clients in 11ms</span>
            </div>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">P99 Latency: 14ms</span>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-y border-border-subtle bg-surface-900/40 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-mono">
              &lt; 15ms
            </div>
            <div className="text-xs text-zinc-400 mt-1">Socket.IO Event Broadcast</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-mono">
              48 Hours
            </div>
            <div className="text-xs text-zinc-400 mt-1">Redis Ephemeral Token TTL</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-mono">
              100%
            </div>
            <div className="text-xs text-zinc-400 mt-1">TypeScript Strict Coverage</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-mono">
              Zero
            </div>
            <div className="text-xs text-zinc-400 mt-1">Layout Shifts on Drag</div>
          </div>
        </div>
      </section>

      {/* Core Features Bento Grid */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            Architecture Highlights
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold text-white mt-2 tracking-tight">
            Built for production. Not just a prototype.
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
            Engineered with the reliability and scalability patterns expected in modern distributed systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bento Card 1: Real-time Engine */}
          <div className="md:col-span-2 rounded-xl border border-border-subtle bg-surface-900 p-6 flex flex-col justify-between hover:border-border-hover transition">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-accent flex items-center justify-center mb-4">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Sub-15ms WebSocket Event Engine
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-md">
                Every card mutation, column reorganization, and board status update broadcasts via Socket.IO
                rooms backed by Redis Pub/Sub. When a teammate drops a task, your screen reflects it instantly
                without polling.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-surface-850 border border-border-subtle font-mono text-[11px] text-zinc-300">
              <span className="text-zinc-500">// Client-side event subscription</span>
              <div className="text-indigo-300 mt-1">
                socket.on('task:moved', (payload) =&gt; queryClient.setQueryData(...))
              </div>
            </div>
          </div>

          {/* Bento Card 2: RBAC & Workspaces */}
          <div className="rounded-xl border border-border-subtle bg-surface-900 p-6 flex flex-col justify-between hover:border-border-hover transition">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Workspace Multi-Tenancy & RBAC
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Clean organization isolation with Owner, Admin, and Member permissions enforced across REST
                middleware and database relations.
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-[10px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">OWNER</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">ADMIN</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">MEMBER</span>
            </div>
          </div>

          {/* Bento Card 3: Optimistic DND */}
          <div className="rounded-xl border border-border-subtle bg-surface-900 p-6 flex flex-col justify-between hover:border-border-hover transition">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Kanban className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Optimistic UI with Rollback
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Zero network lag during card drags. TanStack Query snapshots prior cache state and rolls back
                gracefully if server verification fails.
              </p>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-xs text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[11px] font-mono">Rollback safe on network drop</span>
            </div>
          </div>

          {/* Bento Card 4: Redis Security */}
          <div className="md:col-span-2 rounded-xl border border-border-subtle bg-surface-900 p-6 flex flex-col justify-between hover:border-border-hover transition">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Redis-Backed Ephemeral Invitations
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-lg">
                Instead of leaking indefinite invite links, TeamSync generates cryptographic, single-use
                tokens stored in Redis with an exact 48-hour TTL. Tokens self-destruct upon redemption.
              </p>
            </div>

            <div className="mt-6 p-3 rounded-lg bg-surface-850 border border-border-subtle font-mono text-[11px] text-zinc-300 flex items-center justify-between">
              <span className="text-zinc-400">SET invite:8f7e2a 1 EX 172800</span>
              <span className="text-emerald-400 text-[10px]">TTL 48:00:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Architecture Section */}
      <section id="architecture" className="max-w-5xl mx-auto px-4 py-16 border-t border-border-subtle">
        <div className="text-center mb-10">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            Deep Dive
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1 tracking-tight">
            Full-Stack System Architecture
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Inspect the underlying mechanisms powering real-time synchronization.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-6">
          <div className="p-1 bg-surface-900 border border-border-subtle rounded-lg flex space-x-1">
            <button
              onClick={() => setActiveArchTab('socket')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeArchTab === 'socket'
                  ? 'bg-surface-850 text-white shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1. Socket.IO Room Mesh
            </button>
            <button
              onClick={() => setActiveArchTab('redis')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeArchTab === 'redis'
                  ? 'bg-surface-850 text-white shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              2. Redis TTL & Caching
            </button>
            <button
              onClick={() => setActiveArchTab('prisma')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeArchTab === 'prisma'
                  ? 'bg-surface-850 text-white shadow-sm border border-border-subtle'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              3. PostgreSQL Schema & Prisma
            </button>
          </div>
        </div>

        {/* Code / Visual Box */}
        <div className="rounded-xl border border-border-subtle bg-surface-900 p-5 font-mono text-xs overflow-x-auto shadow-xl">
          {activeArchTab === 'socket' && (
            <div className="space-y-2 text-zinc-300">
              <div className="text-zinc-500">// ts-backend/src/socket.ts - Room event routing</div>
              <div><span className="text-indigo-400">io.on</span>('connection', (socket) =&gt; &#123;</div>
              <div className="pl-4">socket.on('join_board', (boardId) =&gt; &#123;</div>
              <div className="pl-8">socket.join(`board:$&#123;boardId&#125;`);</div>
              <div className="pl-8 text-zinc-500">// Broadcast presence to other board peers</div>
              <div className="pl-8">socket.to(`board:$&#123;boardId&#125;`).emit('user_joined', socket.user);</div>
              <div className="pl-4">&#125;);</div>
              <div className="pl-4">socket.on('task_move', async (data) =&gt; &#123;</div>
              <div className="pl-8 text-emerald-400">socket.to(`board:$&#123;data.boardId&#125;`).emit('task_moved', data);</div>
              <div className="pl-4">&#125;);</div>
              <div>&#125;);</div>
            </div>
          )}

          {activeArchTab === 'redis' && (
            <div className="space-y-2 text-zinc-300">
              <div className="text-zinc-500">// ts-backend/src/services/workspace.service.ts - Ephemeral token creation</div>
              <div><span className="text-indigo-400">const</span> token = crypto.randomBytes(32).toString('hex');</div>
              <div><span className="text-indigo-400">const</span> payload = JSON.stringify(&#123; workspaceId, role &#125;);</div>
              <div className="text-zinc-500">// Set in Redis with 48-hour expiration (172800 seconds)</div>
              <div><span className="text-emerald-400">await</span> redis.set(`invite:$&#123;token&#125;`, payload, 'EX', 172800);</div>
              <div className="mt-3 text-zinc-500">// Atomic token verification & single-use consumption</div>
              <div><span className="text-indigo-400">const</span> data = <span className="text-emerald-400">await</span> redis.getdel(`invite:$&#123;token&#125;`);</div>
            </div>
          )}

          {activeArchTab === 'prisma' && (
            <div className="space-y-2 text-zinc-300">
              <div className="text-zinc-500">// prisma/schema.prisma - Multi-tenant relational model</div>
              <div><span className="text-indigo-400">model</span> Workspace &#123;</div>
              <div className="pl-4">id          String            @id @default(uuid())</div>
              <div className="pl-4">name        String</div>
              <div className="pl-4">members     WorkspaceMember[]</div>
              <div className="pl-4">boards      Board[]</div>
              <div>&#125;</div>
              <div className="mt-2"><span className="text-indigo-400">model</span> Task &#123;</div>
              <div className="pl-4">id          String            @id @default(uuid())</div>
              <div className="pl-4">title       String</div>
              <div className="pl-4">order       Int</div>
              <div className="pl-4">listId      String</div>
              <div className="pl-4">list        List              @relation(fields: [listId], references: [id])</div>
              <div>&#125;</div>
            </div>
          )}
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section id="stack" className="max-w-5xl mx-auto px-4 py-16 border-t border-border-subtle">
        <div className="text-center mb-12">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            Technologies
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1 tracking-tight">
            The Production Tech Stack
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Engineered with modern, battle-tested tools across the entire stack.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'TypeScript', desc: 'End-to-end type safety', tag: 'Client & Server', icon: Code2 },
            { name: 'React 19', desc: 'Concurrent UI & hooks', tag: 'Frontend', icon: Cpu },
            { name: 'Node.js & Express', desc: 'REST API & middleware', tag: 'Backend', icon: Server },
            { name: 'Socket.IO', desc: 'Real-time WebSocket sync', tag: 'Networking', icon: Activity },
            { name: 'PostgreSQL 16', desc: 'ACID relational database', tag: 'Database', icon: Database },
            { name: 'Redis 7', desc: 'Pub/Sub & token caching', tag: 'In-Memory', icon: Zap },
            { name: 'Prisma ORM', desc: 'Declarative type-safe ORM', tag: 'Data Access', icon: GitBranch },
            { name: 'Tailwind CSS', desc: 'Tokenized minimal design', tag: 'Styling', icon: Layers },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-surface-900 border border-border-subtle hover:border-border-hover transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-mono text-accent">{item.tag}</div>
                  <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center text-zinc-400 group-hover:text-accent transition">
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <div className="text-sm font-semibold text-white">{item.name}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="relative rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-900 to-surface-950 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight relative z-10">
            Ready to experience TeamSync?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-3 relative z-10">
            Jump directly into a pre-configured team workspace with sample boards, tasks, and live collaboration.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <button
              onClick={handleDemoClick}
              disabled={isDemoLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-medium bg-accent hover:bg-accent-hover text-white transition shadow-lg shadow-accent/25 hover:shadow-accent/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDemoLoading ? 'Launching demo...' : 'Try Demo Workspace (1-Click)'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-medium bg-surface-850 hover:bg-surface-800 border border-border-subtle text-zinc-200 transition"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-canvas py-8 text-xs text-zinc-500 font-sans">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-white">
              <Layers className="w-3 h-3" />
            </div>
            <span className="font-semibold text-zinc-300">TeamSync</span>
            <span className="text-zinc-600">·</span>
            <span>Production-Ready Collaboration Platform</span>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
