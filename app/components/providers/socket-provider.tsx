"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { Socket } from "socket.io";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// custom hook
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // console.log('public url: ',process.env.NEXT_PUBLIC_SITE_URL)
    // console.log('public url: ',process.env.NEXTAUTH_URL)
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      // process.env.NEXTAUTH_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
      }
    );

    socketInstance.on("connect", () => {
      console.log("client connected");
      setIsConnected(true);
    });
    socketInstance.on("disconnect", () => {
      console.log("client disconnected");
      setIsConnected(false);
    });
    socketInstance.on("error", (data: any) => {
      console.log("client error", data);
      toast.error(`${data}`);
      // window.location.reload();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
