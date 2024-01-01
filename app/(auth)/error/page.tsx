import Background from "@/components/ui/wrapper";
import Link from "next/link";
import React from "react";

const AuthError = () => {
  return (
    <Background>
      <div className="w-[400px] h-[300px] bg-zinc-600 rounded-[20px] flex flex-col justify-center items-center">
        <div className="text-[2rem] font-bold my-2 text-gray-200">
          Some error occured :(
        </div>
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          Please try logging in again.
        </div>
        <Link
          href={"/dashboard"}
          className="text-[16px] font-semibold my-4 text-gray-300 hover:underline"
        >
          {process.env.NEXTAUTH_URL}/signin
        </Link>
      </div>
    </Background>
  );
};

export default AuthError;
