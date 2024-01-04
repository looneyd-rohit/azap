import React from "react";
import { Button } from "./button";

const CustomButton = (props: any) => {
  const { children, className, ...propsWithoutChildren } = props;
  return (
    <Button
      type="submit"
      className={`border rounded-xl focus-visible:ring-0 focus:outline-none active:outline-none focus:bg-zinc-300 hover:bg-zinc-400 focus:text-zinc-900 hover:text-zinc-800 w-[125px] h-[50px] text-xl font-semibold ${
        className ? className : ""
      }`}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
