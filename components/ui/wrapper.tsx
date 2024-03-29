import { SocketIndicator } from "@/app/components/socket-indicator";
import React from "react";

const Background = ({
  children,
  position,
}: {
  children: React.ReactNode;
  position: string;
}) => {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-16 overflow-hidden">
      <div className="relative w-full max-w-lg">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-neutral-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className={`${position} w-[700px] max-w-[95vw] flex flex-col justify-center items-center`}>{children}</div>
    </div>
  );
};

export default Background;
