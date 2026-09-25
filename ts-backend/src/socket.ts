import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './utils/jwt';
import { redis } from './config/redis';

let io: SocketIOServer | undefined;

export function initializeSocket(httpServer: HttpServer): SocketIOServer {
	if (io) {
		return io;
	}

	io = new SocketIOServer(httpServer, {
		cors: {
			origin: process.env.CLIENT_URL ?? '*',
			methods: ['GET', 'POST'],
		},
	});

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = verifyToken(token);
            socket.data.userId = decoded.userId;
            next();
        } catch {
            next(new Error('Invalid or expired token'));
        }
    });

	io.on('connection', (socket) => {
		socket.on('join-board', async (boardId: string) => {
        const userId = socket.data.userId || socket.id;

        if (userId) {
            socket.join(`user:${userId}`);
        }

        const room = `board:${boardId}`;
        const redisKey = `board:${boardId}:active_users`;

        socket.join(room);
        socket.data.currentBoard = boardId;

        // Add user to the Redis active viewers set
        await redis.sadd(redisKey, userId);
        const activeUsers = await redis.smembers(redisKey);

        // Broadcast updated presence list to everyone on this board
        io?.to(room).emit('presence:update', {
            boardId,
            activeUsers,
        });
        });

        socket.on('leave-board', async (boardId: string) => {
        const userId = socket.data.userId || socket.id;
        const room = `board:${boardId}`;
        const redisKey = `board:${boardId}:active_users`;

        socket.leave(room);
        socket.data.currentBoard = null;

        await redis.srem(redisKey, userId);
        const activeUsers = await redis.smembers(redisKey);

        io?.to(room).emit('presence:update', {
            boardId,
            activeUsers,
        });
        });

        socket.on('disconnect', async () => {
        const boardId = socket.data.currentBoard;
        const userId = socket.data.userId || socket.id;

        if (boardId) {
            const redisKey = `board:${boardId}:active_users`;
            await redis.srem(redisKey, userId);
            const activeUsers = await redis.smembers(redisKey);

            io?.to(`board:${boardId}`).emit('presence:update', {
            boardId,
            activeUsers,
            });
        }
        });
	});

	return io;
}

export function getSocket(): SocketIOServer {
	if (!io) {
		throw new Error('Socket.IO has not been initialized. Call initializeSocket first.');
	}

	return io;
}

export async function closeSocket(): Promise<void> {
	if (!io) {
		return;
	}

	await new Promise<void>((resolve, reject) => {
		io?.close((error) => {
			io = undefined;

			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
}
