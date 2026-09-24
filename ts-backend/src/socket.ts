import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from './utils/jwt';

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
		console.log(`Socket connected: ${socket.id}`);

		socket.on('join-board', (boardId: string) => {
			socket.join(`board:${boardId}`);
		});

		socket.on('leave-board', (boardId: string) => {
			socket.leave(`board:${boardId}`);
		});

		socket.on('disconnect', (reason) => {
			console.log(`Socket disconnected: ${socket.id} (${reason})`);
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
