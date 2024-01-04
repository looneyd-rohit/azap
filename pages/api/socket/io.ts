import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types";
import { RedisClient } from "@/config/redis";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });
    io.on("connection", async (socket: any) => {
      console.log("socket connected...");
      console.log("gandu:", socket.id);

      socket.on("create-room", async ({ roomId }: { roomId: string }) => {
        console.log("room: ", roomId);
        // check whether room already has 2 users
        const countOfUsers = await RedisClient.get(roomId);
        console.log("count of users: ", countOfUsers);
        if (countOfUsers === 2) {
          socket.emit("error", { message: "Room is full" });
          return;
        } else if (countOfUsers === null) {
          socket.join(roomId);
          await Promise.all([
            RedisClient.set(roomId, 1),
            RedisClient.set(socket.id, roomId),
          ]);
        } else if (countOfUsers === 1) {
          socket.join(roomId);
          await Promise.all([
            RedisClient.set(roomId, 2),
            RedisClient.set(socket.id, roomId),
          ]);
        }
        console.log("count of users: ", await RedisClient.get(roomId));
      });

      // file upload
      socket.on(
        "file-upload",
        async ({
          roomId,
          chunkIndex,
          chunk,
        }: {
          roomId: string;
          chunkIndex: Number;
          chunk: Blob;
        }) => {
          console.log("file upload: ", chunk);
          console.log(roomId, chunkIndex, chunk);
          // socket.to(roomId).emit("file-upload", file);
        }
      );

      socket.on("disconnect", async () => {
        console.log("socket disconnected: ", socket.id);
        // remove user from room
        const roomId: string | null = await RedisClient.get(socket.id);
        if (roomId) {
          // if user was in a room then do the following
          await Promise.all([
            RedisClient.del(socket.id),
            RedisClient.decr(roomId),
          ]);
          const countOfUsers = await RedisClient.get(roomId);
          console.log("[decr] count of users: ", countOfUsers);
          if (countOfUsers === 0 || countOfUsers == null) {
            await RedisClient.del(roomId);
          }
        }
      });
    });
    res.socket.server.io = io;
  }

  res.end();
};

export default ioHandler;
