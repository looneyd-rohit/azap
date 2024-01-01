"use client";

import { signOut, useSession } from "next-auth/react";
import Background from "../../../components/ui/wrapper";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function SignOut() {
  // check if authenticated
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin?callbackUrl=/dashboard");
    },
  });
  return (
    <Background>
      <div className="w-[400px] h-[300px] bg-zinc-600 rounded-[20px] flex flex-col justify-center items-center">
        <div className="text-[2rem] font-bold my-2 text-gray-200">Signout</div>
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          Are you sure you want to sign out?
        </div>
        <Button
          type="submit"
          className="border rounded-xl focus-visible:ring-0 focus:outline-none active:outline-none focus:bg-zinc-300 hover:bg-zinc-400 focus:text-zinc-900 hover:text-zinc-800 w-[100px] h-[50px] text-xl font-semibold"
          onClick={() => signOut({ callbackUrl: "/signin" })}
        >
          Sign Out
        </Button>
      </div>
    </Background>
  );
}
