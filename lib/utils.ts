import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GetNewWorkerInstance = (): Worker => {
  return new Worker(new URL("./worker.ts", import.meta.url));
};
