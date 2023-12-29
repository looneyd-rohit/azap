"use client";

import React, { FormEvent } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const UpdateForm = () => {
  const [image, setImage] = React.useState("");
  const { data: session, update } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("api/auth/signin?callbackUrl=/client");
    },
  });
  // function to upload
  const uploadHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(image);
    const res = await update({ image });
    console.log(res);
  };
  return (
    <div>
      <br />
      <br />
      <form>
        <input
          onChange={(e) => {
            setImage(e.target.value);
          }}
          type="text"
          className="border border-black"
        />
        <button onClick={uploadHandler}>upload</button>
      </form>
    </div>
  );
};

export default UpdateForm;
