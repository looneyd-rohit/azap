import {Server as NetServer, Socket} from 'net';
import {NextApiResponse} from 'next';
import {Server as SocketIOServer} from 'socket.io';

declare module "*.css";

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        }
    }
}