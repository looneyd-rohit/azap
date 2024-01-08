import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ProcessAndSendChunkTypes = {
  chunk: any;
  index: number;
  roomId: string;
  id: string;
  isLastChunk: boolean;
  fileName: string;
  fileSize: number;
};

const userToRoomMap = new Map<string, string>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });

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
          io.sockets.in(roomId!).emit("peer-disconnect", "Peer left the room");
        }
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
