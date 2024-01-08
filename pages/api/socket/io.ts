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

let rooms: string[] = new Array<string>();
const roomsToUserMap = new Map<string, string[]>();
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
      socket.on("join-room", (roomId) => {
        socket.join(roomId);
        const existingUsers = roomsToUserMap.get(roomId) || [];
        if (existingUsers.length === 2) {
          socket.emit("error", "Room is full");
          return;
        }
        roomsToUserMap.set(roomId, [...existingUsers, socket.id]);
        userToRoomMap.set(socket.id, roomId);
        // rooms.push(socket.id);
        socket.join(roomId);
        console.log("Rooms:", roomsToUserMap);
        const otherUser = roomsToUserMap
          .get(roomId)
          ?.filter((id) => id !== socket.id)[0];
        if (otherUser) {
          socket.emit("other-user: ", otherUser);
          socket.to(otherUser).emit("user-connected", socket.id);
        }
      });

      socket.on("sending-signal", (payload) => {
        console.log("sending-signal: ", payload);
        io.to(payload.target).emit("user-joined", payload);
      });

      socket.on("returning-signal", (payload) => {
        io.to(payload.target).emit("receiving-returned-signal", payload);
      });

      socket.on("disconnect", () => {
        console.log("Roomssss", roomsToUserMap);
        const roomId = userToRoomMap.get(socket.id);
        if (!roomId) return;
        userToRoomMap.delete(socket.id);
        const newUsers = roomsToUserMap
          .get(roomId!)
          ?.filter((user) => user !== socket.id);
        roomsToUserMap.set(roomId!, newUsers || []);
        console.log("disconnect: ", socket.id);
        console.log("roomId: ", roomId);
        // emit about peer leaving the room if peer was in the room
        io.sockets.in(roomId!).emit("peer-disconnect", "Peer left the room");
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
