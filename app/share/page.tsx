"use client";
import React, { Fragment } from "react";
import { SocketIndicator } from "@/app/components/socket-indicator";
import Background from "@/components/ui/wrapper";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/ui/CustomButton";
import { useRouter } from "next/navigation";
import { createId } from "@/config/cuid";

const Socket = () => {
  const form = useForm();
  const router = useRouter();

  const createRoomHandler = () => {
    const roomId = createId();
    router.push(`/share/c?roomId=${roomId}`);
  };

  return (
    <main>
      <div className="absolute right-[15px] top-[15px] sm:right-[25px] sm:top-[25px] ml-auto flex items-center">
        <SocketIndicator />
      </div>
      <Background position="absolute">
        <form
          onSubmit={form.handleSubmit(createRoomHandler)}
          className="z-1000"
        >
          <CustomButton
            type="submit"
            className="w-[150px] bg-orange-600 hover:bg-orange-400 hover:text-gray-900"
          >
            Create Room
          </CustomButton>
        </form>
      </Background>
    </main>
  );
};

export default Socket;
