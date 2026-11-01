import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const alex = await prisma.user.upsert({
    where: { email: 'alex@teamsync.com' },
    update: {},
    create: {
      email: 'alex@teamsync.com',
      name: 'Alex Developer',
      password: passwordHash,
    },
  });

  const steve = await prisma.user.upsert({
    where: { email: 'steve@teamsync.com' },
    update: {},
    create: {
      email: 'steve@teamsync.com',
      name: 'Steve Rogers',
      password: passwordHash,
    },
  });

  console.log(`✓ Seeded users: ${alex.email}, ${steve.email}`);

  // 2. Seed Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { name: 'Team AlphaHQ' },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Team AlphaHQ',
        description: 'Main product engineering and design collaboration workspace.',
        members: {
          create: [
            { userId: alex.id, role: 'OWNER' },
            { userId: steve.id, role: 'MEMBER' },
          ],
        },
      },
    });
    console.log(`✓ Created workspace: ${workspace.name}`);
  }

  // 3. Seed Board
  let board = await prisma.board.findFirst({
    where: { workspaceId: workspace.id, title: 'Frontend Development' },
  });

  if (!board) {
    board = await prisma.board.create({
      data: {
        title: 'Frontend Development',
        workspaceId: workspace.id,
      },
    });
    console.log(`✓ Created board: ${board.title}`);
  }

  // 4. Seed Lists & Tasks if empty
  const existingLists = await prisma.list.count({
    where: { boardId: board.id },
  });

  if (existingLists === 0) {
    const backlog = await prisma.list.create({
      data: { title: 'Backlog', order: 0, boardId: board.id },
    });

    const inProgress = await prisma.list.create({
      data: { title: 'In Progress', order: 1, boardId: board.id },
    });

    const inReview = await prisma.list.create({
      data: { title: 'In Review', order: 2, boardId: board.id },
    });

    const done = await prisma.list.create({
      data: { title: 'Done', order: 3, boardId: board.id },
    });

    // Task 1: In Progress - Multiplayer Drag Presence
    await prisma.task.create({
      data: {
        title: 'Multiplayer Real-Time Drag Presence',
        description: 'Implement WebSocket ghost indicator and peer presence chips during card movement without layout thrashing.',
        order: 0,
        listId: inProgress.id,
        assigneeId: alex.id,
        checklist: {
          create: [
            { title: 'Add socket drag-start and drag-end events', isDone: true, order: 0 },
            { title: 'Render safety-orange peer ghost chip on dragged card', isDone: true, order: 1 },
            { title: 'Debounce rapid drag updates over Redis pub/sub', isDone: false, order: 2 },
          ],
        },
        comments: {
          create: [
            { content: 'WebSocket latency tests across local instances look solid at <8ms.', userId: steve.id },
            { content: 'Agreed! Ghost chip positioning is now strictly tied to the card item ID.', userId: alex.id },
          ],
        },
        activities: {
          create: [
            { action: 'created the task', userId: alex.id },
            { action: 'assigned to Alex Developer', userId: alex.id },
            { action: 'completed subtask "Add socket drag-start and drag-end events"', userId: alex.id },
          ],
        },
      },
    });

    // Task 2: In Progress - Command Palette
    await prisma.task.create({
      data: {
        title: 'Universal Command Palette (Ctrl+K / ⌘K)',
        description: 'Instant fuzzy search across boards, workspace navigation, direct task inspection, and quick actions.',
        order: 1,
        listId: inProgress.id,
        assigneeId: steve.id,
        checklist: {
          create: [
            { title: 'Global key listener with ESC backdrop dismissal', isDone: true, order: 0 },
            { title: 'Keyboard arrow-key navigation with active index', isDone: true, order: 1 },
            { title: 'Action execution callback for board switching', isDone: false, order: 2 },
          ],
        },
        comments: {
          create: [
            { content: 'Shortcut works seamlessly from any view in the app!', userId: steve.id },
          ],
        },
        activities: {
          create: [
            { action: 'created the task', userId: steve.id },
            { action: 'assigned to Steve Rogers', userId: steve.id },
          ],
        },
      },
    });

    // Task 3: In Review - Anti-Slop Audit
    await prisma.task.create({
      data: {
        title: 'Design System Audit & Anti-Slop Enforcement',
        description: 'Ensure 0 linter violations: enforce dense-tiles, monochrome borders, Jost typography, and remove generic AI-slop tropes.',
        order: 0,
        listId: inReview.id,
        assigneeId: alex.id,
        checklist: {
          create: [
            { title: 'Verify data-ui tokens on bordered containers', isDone: true, order: 0 },
            { title: 'Replace pulsing/bouncing animations with static accents', isDone: true, order: 1 },
            { title: 'Run design-taste-frontend linter across all 26 components', isDone: true, order: 2 },
          ],
        },
        comments: {
          create: [
            { content: 'Audit completed: 0 FAILs across the entire frontend suite.', userId: alex.id },
          ],
        },
        activities: {
          create: [
            { action: 'created the task', userId: alex.id },
            { action: 'completed all checklist items', userId: alex.id },
          ],
        },
      },
    });

    // Task 4: Backlog - Docker Production
    await prisma.task.create({
      data: {
        title: 'Docker Production Orchestration',
        description: 'Verify multi-stage Vite/Nginx frontend container and Alpine Node backend container with Postgres 16 & Redis 7.',
        order: 0,
        listId: backlog.id,
        checklist: {
          create: [
            { title: 'Configure docker-compose.yml networking', isDone: true, order: 0 },
            { title: 'Test Nginx reverse proxy routing for /api and /socket.io', isDone: true, order: 1 },
          ],
        },
      },
    });

    // Task 5: Done - Subtasks & Realtime Typing
    await prisma.task.create({
      data: {
        title: 'Subtasks & Live Typing Indicator Backend',
        description: 'Prisma schema extension with ChecklistItem, Comment, and TaskActivity models and socket relays.',
        order: 0,
        listId: done.id,
        assigneeId: alex.id,
        checklist: {
          create: [
            { title: 'Prisma db push and schema migration', isDone: true, order: 0 },
            { title: 'REST controller CRUD endpoints', isDone: true, order: 1 },
            { title: 'Typing presence socket broadcast', isDone: true, order: 2 },
          ],
        },
      },
    });

    console.log('✓ Seeded board lists and initial tasks');
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
