import express from 'express';
import next from 'next';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const port = 3000;
const dev = process.env.NODE_ENV !== 'production';

const app = next({ });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const expressApp = express();

    // Example middleware
    expressApp.use(express.json());

    // Example REST route
    expressApp.get('/health', (_, res) => {
        res.json({ status: 'ok' });
    });

    // Let Next.js handle everything else
    expressApp.use((req, res) => {
        return handle(req, res);
    });

    const httpServer = createServer(expressApp);

    const path = "/api/socket/io";

    const userToRoomMap = new Map<string, string>();

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
        path,
        addTrailingSlash: false,
    });

    io.attach(httpServer);

    // socket handling events logic
    io.on("connection", (socket) => {
        socket.on("join-room", (roomId: string) => {
            console.log("socket room: ", io.sockets.adapter.rooms.get(roomId));

            const room = io.sockets.adapter.rooms.get(roomId);

            if (room?.size === 2) {
                socket.emit("error", "Room is full");
                return;
            }

            socket.join(roomId);

            userToRoomMap.set(socket.id, roomId);

            console.log("Rooms: ", room);

            const otherUser = Array.from(room || []).filter(
                (id) => id !== socket.id
            )[0];

            if (otherUser) {
                socket.emit("other-user: ", otherUser);
                socket.to(otherUser).emit("user-connected", socket.id);
            }
        });

        socket.on("sending-signal", (payload) => {
            // console.log("sending-signal: ", payload);
            io.to(payload.target).emit("user-joined", payload);
        });

        socket.on("returning-signal", (payload) => {
            io.to(payload.target).emit("receiving-returned-signal", payload);
        });

        socket.on("sent-progress", (progress) => {
            const roomId = userToRoomMap.get(socket.id);
            if (!roomId) {
                socket.emit("error", "Room is not found");
                return;
            }
            const otherPeer = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            ).filter((id) => id !== socket.id)[0];
            if (!otherPeer) {
                socket.emit("error", "Peer is not found");
                return;
            }
            socket.to(otherPeer).emit("received-progress", progress);
        });

        socket.on("disconnect", () => {
            const roomId = userToRoomMap.get(socket.id);

            if (!roomId) return;

            const room = Array.from(io.sockets.adapter.rooms.get(roomId!) || []);
            console.log("Roomssss", room);

            userToRoomMap.delete(socket.id);

            const remainingUsers = room.filter((user) => user !== socket.id) || [];

            console.log("disconnect: ", socket.id);
            console.log("roomId: ", roomId);

            // emit about peer leaving the room if peer was in the room
            const isPeerInRoom = remainingUsers.length > 0;
            if (isPeerInRoom) {
                io.sockets.in(roomId).emit("peer-disconnect", "Peer left the room");
            }
        });
    });

    httpServer.listen(port, '0.0.0.0', () => {
        console.log(`> Express + Next + Socket.IO on http://localhost:${port}`);
    });
});
