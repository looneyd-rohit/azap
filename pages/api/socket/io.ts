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

const rooomToHostMap = new Map<string, string>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });
    io.on("connection", async (socket: any) => {
      console.log(`socket: [${socket.id}] connected...`);
      console.log("gandu:", socket.id);

      // create room
      // host creates a room
      socket.on("create-room", async ({ roomId }: { roomId: string }) => {
        socket.join(roomId);
        socket.join(socket.id);
        socket.roomId = roomId;
        socket.host = true;
        rooomToHostMap.set(roomId, socket.id);
        console.log(`socket: [${socket.id}] created room: ${roomId}`);
        console.log(`socket: [${socket.id}] is the [HOST]`);
      });

      // join room
      socket.on("join-room", async ({ roomId }: { roomId: string }) => {
        socket.join(roomId);
        socket.join(socket.id);
        socket.roomId = roomId;
        console.log(`socket: [${socket.id}] joined room: ${roomId}`);
      });

      // file download
      socket.on("file-download", async ({ roomId }: { roomId: string }) => {
        const hostId = rooomToHostMap.get(roomId);
        // socket.to(hostId).emit("file-upload", { roomId });
        // send upload event to host
        io.sockets.in(hostId!).emit("file-upload", { roomId, id: socket.id });
        console.log(`socket: [${socket.id}] file download: ${roomId}`);
      });

      // process and send chunk
      socket.on(
        "process-and-send-chunk",
        async ({
          chunk,
          index,
          roomId,
          id,
          isLastChunk,
          fileName,
          fileSize,
        }: ProcessAndSendChunkTypes) => {
          const data = {
            chunk,
            roomId,
            id,
            isLastChunk,
            fileName,
            fileSize,
          };
          io.to(id).emit("download-chunk", data);
          console.log(
            `socket: [${socket.id}] sent chunk to: ${id} in room: ${roomId}`
          );
        }
      );

      // error broadcasting
      socket.on("error-broadcast", (msg: string) => {
        socket.broadcast.emit("error", msg);
      });

      socket.on("disconnect", async () => {
        console.log(`socket: [${socket.id}] disconnected`);
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
