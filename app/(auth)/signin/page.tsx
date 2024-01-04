"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Background from "../../../components/ui/wrapper";
import { signIn, useSession } from "next-auth/react";
import {
  GithubLoginButton,
  GoogleLoginButton,
} from "react-social-login-buttons";
import { redirect } from "next/navigation";
import CustomButton from "@/components/ui/CustomButton";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export default function SignIn() {
  // check if already signed in
  const { data: session } = useSession({
    required: false,
  });

  if (session) {
    redirect("/dashboard");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    signIn("email", { email: values.email, callbackUrl: "/dashboard" });
  }

  return (
    <Background position="absolute">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 flex flex-col items-center justify-center w-full h-full z-1000"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-center items-center">
                <label className="my-4 text-2xl">Email Address</label>
                <FormControl>
                  <Input
                    className="border border-black rounded-xl w-[450px] h-[60px]  focus:outline-none active:outline-none focus-visible:ring-0 focus:bg-gray-300 hover:bg-gray-200 text-xl font-semibold"
                    placeholder="Enter your Email Address"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xl" />
              </FormItem>
            )}
          />
          <CustomButton type="submit">Sign In</CustomButton>
        </form>
      </Form>
      <div className="flex justify-center items-center w-full mt-6">
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          <GithubLoginButton
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          />
        </div>
        <div className="text-[14px] font-semibold my-2 text-gray-200">
          <GoogleLoginButton
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          />
        </div>
      </div>
    </Background>
  );
}
