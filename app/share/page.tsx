import React, { Fragment } from "react";
import { SocketIndicator } from "@/app/components/socket-indicator";

const Socket = () => {
  return (
    <main>
      <div className="absolute right-[15px] top-[15px] sm:right-[25px] sm:top-[25px] ml-auto flex items-center">
        <SocketIndicator />
      </div>
    </main>
  );
};

export default Socket;
