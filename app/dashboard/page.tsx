import React from "react";
import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import UpdateForm from "./form";

const Dashbord = async () => {
  const session = await getServerSession(options);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Protected route</p>
      <p>{session?.user?.name as string}</p>
      <p>{session?.user?.email as string}</p>
      <Image
        width={300}
        height={300}
        src={(session?.user?.image as string) || ""}
        alt="user image"
      />
      <UpdateForm />
    </div>
  );
};

export default Dashbord;
