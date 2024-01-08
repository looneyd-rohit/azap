import React, { Fragment } from "react";
import Upload from "../components/Upload";
import { SocketIndicator } from "@/app/components/socket-indicator";

const Socket = () => {
  return (
    <main>
      <div className="absolute right-[15px] top-[15px] sm:right-[25px] sm:top-[25px] ml-auto flex items-center">
        <SocketIndicator />
      </div>
      <Upload />
    </main>
  );
};

export default Socket;
