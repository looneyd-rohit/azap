"use client";

import { signOut, useSession } from "next-auth/react";
import Background from "../../../components/ui/wrapper";
import { redirect } from "next/navigation";
import CustomButton from "@/components/ui/CustomButton";
import { useForm } from "react-hook-form";

export default function SignOut() {
  // check if authenticated
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin?callbackUrl=/dashboard");
    },
  });
  const form = useForm();
  const onSubmit = () => {
    signOut({ callbackUrl: "/signin" });
  };
  return (
    <Background position="absolute">
      <div className="w-[400px] h-[300px] bg-zinc-600 rounded-[20px] flex flex-col justify-center items-center">
        <div className="text-[2rem] font-bold my-2 text-gray-200">Signout</div>
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          Are you sure you want to sign out?
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="z-1000">
          <CustomButton type="submit">Sign Out</CustomButton>
        </form>
      </div>
    </Background>
  );
}
