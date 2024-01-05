import React from "react";
import { Button } from "./button";

const CustomButton = (props: any) => {
  const { children, className, disabled, ...propsWithoutChildren } = props;
  return (
    <Button
      type="submit"
      className={` border rounded-xl focus-visible:ring-0 focus:outline-none active:outline-none focus:bg-zinc-300 hover:bg-zinc-400 focus:text-zinc-900 hover:text-zinc-800 w-[125px] h-[50px] text-xl font-semibold ${
        className ? className : ""
      } ${
        disabled
          ? "bg-zinc-300 hover:bg-zinc-300 focus:bg-zinc-300 text-zinc-800 cursor-not-allowed"
          : ""
      }`}
      {...propsWithoutChildren}
    >
      {children}
      {disabled && (
        <span className="text-[8px] absolute -bottom-1">(disabled)</span>
      )}
    </Button>
  );
};

export default CustomButton;
