import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import crypto from 'node:crypto';
import { redis }  from '../config/redis';

const prisma = new PrismaClient();

const createInviteSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN'], 'Role must be either MEMBER or ADMIN'),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1,'Invalid invite token'),
});

export const createWorkspaceInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(
      'Available Prisma models:',
      Object.keys(prisma).filter((key) => !key.startsWith('$') && !key.startsWith('_'))
    );
    const { id: workspaceId } = req.params;
    const userId = req.userId!;
    const { role } = createInviteSchema.parse(req.body || {});

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, role: { in: ['OWNER', 'ADMIN'] } },
    });

    if (!membership) {
      res.status(403).json({ error: 'Access denied: You do not have permission to invite users to this workspace' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    const redisKey = `invite:${token}`;
    
    const inviteData = { workspaceId, role, invitedBy: userId };

    await redis.set(redisKey, JSON.stringify(inviteData), 'EX', 172800);

    res.status(201).json({ message: 'Invite created successfully', inviteToken: token, expiresIn: '48 hours' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const acceptWorkspaceInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { token } = acceptInviteSchema.parse(req.body);

    const redisKey = `invite:${token}`;
    const rawData = await redis.get(redisKey);

    if (!rawData) {
      res.status(400).json({ error: 'Invalid or expired invite token' });
      return;
    }

    const { workspaceId, role } = JSON.parse(rawData);

    const existingMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });

    if (existingMember) {
      res.status(409).json({ error: 'You are already a member of this workspace' });
      return;
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId,
        role,
      },
      include: {
        workspace: true,
      },
    });

    await redis.del(redisKey);

    res.status(200).json({
      message: 'Successfully joined workspace',
      workspace: newMember.workspace,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  description: z.string().optional(),
});

export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createWorkspaceSchema.parse(req.body);
    const userId = req.userId!; // We know this exists because of the auth middleware

    const workspace = await prisma.workspace.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
    });

    res.status(201).json({ message: 'Workspace created successfully', workspace });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getUserWorkspaces = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Find all workspaces where this user is a member
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }, // Don't return passwords!
            },
          },
        },
      },
    });

    res.status(200).json({ workspaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/workspaces/:id/members
export const getWorkspaceMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: workspaceId } = req.params;
    const userId = req.userId!;

    // Ensure requester is a member of the workspace
    const isMember = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });

    if (!isMember) {
      res.status(403).json({ error: 'Access denied: not a member of this workspace' });
      return;
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};