"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";

const Client = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/signin?callbackUrl=/client");
    },
  });
  return (
    <div>
      <h1>Client</h1>
      <p>Protected route</p>
      <p>{session?.user?.name as string}</p>
      <p>{session?.user?.email as string}</p>
      <Image
        src={(session?.user?.image as string) || ""}
        width={300}
        height={300}
        alt="user image"
      />
    </div>
  );
};

export default Client;

// function Auth({ children }: any) {
//   // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
//   const { status } = useSession({ required: true });

//   if (status === "loading") {
//     return <div>Loading...</div>;
//   }
//   console.log("inside client auth");
//   return children;
// }
