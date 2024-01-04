"use client";
import CustomButton from "@/components/ui/CustomButton";
import Background from "@/components/ui/wrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StyleSheetManager } from "styled-components";
import ContainerComponent from "../../../components/ContainerComponent";

export default function Download() {
  const form = useForm();

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    if (acceptedFiles.length !== 1) {
      toast.error("Please select only one file.");
      return;
    }

    const file = acceptedFiles[0];

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be less than 100MB.");
      return;
    }

    if (file.size === 0) {
      toast.error("File cannot be empty.");
      return;
    }

    if (file.type === "" || file.type === "application/x-msdownload") {
      toast.error("Invalid file type or folder selected.");
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive: isdragactive,
    isFocused: isfocused,
    isDragAccept: isdragaccept,
    isDragReject: isdragreject,
  } = useDropzone({
    onDrop,
    disabled: selectedFileName !== null,
    multiple: false,
  });

  const removeFileHandler = (e: any) => {
    setSelectedFileName(null);
  };

  const uploadFileHandler = (e: any) => {
    if (!selectedFile) {
      toast.error("Some error occured. Please try again.");
      return;
    }
    console.log("uploaded...");
    console.log(selectedFile);
  };

  return (
    <>
      <Background position="relative">
        <div className="container max-w-[90vw] w-[450px]  flex flex-col  items-center gap-4 select-none">
          <StyleSheetManager
            shouldForwardProp={(prop) =>
              prop !== "isfocused" &&
              prop !== "isdragaccept" &&
              prop !== "isdragreject" &&
              prop !== "selectedfilename"
            }
          >
            <ContainerComponent
              getRootProps={getRootProps}
              isfocused={isfocused}
              isdragaccept={isdragaccept}
              isdragreject={isdragreject}
              selectedfilename={selectedFileName}
              getInputProps={getInputProps}
            />
          </StyleSheetManager>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            {selectedFileName && (
              <form
                onSubmit={form.handleSubmit(removeFileHandler)}
                className="z-1000"
              >
                <CustomButton type="submit" className="w-[150px]">
                  Remove File
                </CustomButton>
              </form>
            )}
            {selectedFileName && (
              <form
                onSubmit={form.handleSubmit(uploadFileHandler)}
                className="z-1000"
              >
                <CustomButton type="submit" className="w-[150px]">
                  Upload
                </CustomButton>
              </form>
            )}
          </div>
        </div>
      </Background>
      <ToastContainer />
    </>
  );
}
