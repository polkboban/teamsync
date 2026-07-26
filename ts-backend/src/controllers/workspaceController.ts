import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Validation Schema
const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  description: z.string().optional(),
});

// 1. CREATE WORKSPACE
export const createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createWorkspaceSchema.parse(req.body);
    const userId = req.userId!; // We know this exists because of the auth middleware

    // Create the workspace AND attach the user as the OWNER in one transaction
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

// 2. GET USER'S WORKSPACES
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