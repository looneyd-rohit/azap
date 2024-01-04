"use client";
import React from "react";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import Background from "@/components/ui/wrapper";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/ui/CustomButton";

const schema = z.object({
  files: z.instanceof(File).refine(
    (file) => {
      return file.size < 10485760;
    },
    {
      message: "File size must be less than 10MB",
    }
  ),
  // .array(
  //   z.instanceof(File)
  //   // Don't validate individual file. The error below will be ignored.
  //   // .refine((file) => file.size < 1024, "File size must be less than 1kb")
  // )
  // .min(1, "At least 1 file is required")
  // .max(1, "Only 1 file is allowed"),
  // Instead, please validate it on the array level
  // .refine(
  //   (files) => files.every((file) => file.size < 1024),
  //   "File size must be less than 1kb"
  // ),
});

const Download = () => {
  const [form, { files }] = useForm({
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
  });

  console.log(files);
  const submitHandler = (e: any) => {
    e.preventDefault();
    console.log(e);
    console.log(form.errors);
    // console.log(e.currentTarget.error);
    // console.log(e.target.files.error);
    // console.log("type: ", typeof e);
    // console.log("submit: ", e.target.files.files[0]);
  };
  // console.log(form.props.onSubmit);
  // console.log(files);

  return (
    <Background position="absolute">
      <form
        encType="multipart/form-data"
        {...form.props}
        // onSubmit={submitHandler}
        // action={() => submitHandler()}
        className="space-y-8 flex flex-col items-center justify-center w-full h-full z-1000"
      >
        {/* <div className="flex flex-col justify-center items-center">
          <label>Mutliple Files</label>
          <input type="file" name={files.name} multiple />
          <div>{files.error}</div>
        </div> */}
        <FormItem className="flex flex-col justify-center items-center">
          <Label htmlFor="file">Select Your File</Label>
          <Input id="files" type="file" name={files.name} />
          <div>{files.error}</div>
        </FormItem>
        <CustomButton>Upload</CustomButton>
      </form>
    </Background>
  );
};

export default Download;
