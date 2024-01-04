"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "../../components/ui/badge";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();
  if (!isConnected) {
    return (
      <Badge variant="outline" className="w-[120px] h-[25px] flex justify-center items-center bg-orange-600 text-white border-none">
        Polling... (1s)
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="w-[120px] h-[25px] flex justify-center items-center bg-emerald-600 text-white border-none">
      Socket Active
    </Badge>
  );
};
