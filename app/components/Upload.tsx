"use client";
import CustomButton from "@/components/ui/CustomButton";
import Background from "@/components/ui/wrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StyleSheetManager } from "styled-components";
import ContainerComponent from "./ContainerComponent";
import { useSocket } from "./providers/socket-provider";
import { createId } from "@/config/cuid";
import { MdLinkOff } from "react-icons/md";

export default function Upload() {
  const form = useForm();

  const { socket, isConnected } = useSocket();

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRoomJoined, setIsRoomJoined] = useState<boolean>(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>(createId());

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

  const joinRoomHandler = (e: any) => {
    if (!socket || !isConnected) {
      toast.error("Some error occured. Please try again.");
      return;
    }
    // user will have to join a room
    const randomId = createId().toString();
    console.log(randomId);
    socket?.emit("create-room", { roomId: randomId });
    setIsRoomJoined(true);
    setCurrentRoomId(randomId);
  };

  const uploadFileHandler = (e: any) => {
    if (
      !selectedFileName ||
      !selectedFile ||
      !isConnected ||
      !socket ||
      !isRoomJoined
    ) {
      toast.error("Some error occured. Please try again.");
      return;
    }
    console.log("uploaded...");
    console.log(selectedFile);

    // emit the file to the room only if receiver is present on the room
    // emitting occurs in chunks of 1MB
    const chunkSize = 1024 * 1024;
    const fileSize = selectedFile.size;
    const chunks = Math.ceil(fileSize / chunkSize);
    const chunkArray = Array.from(Array(chunks).keys());
    console.log(chunks);
    console.log(chunkArray);
    chunkArray.forEach((chunkIndex) => {
      const start = chunkIndex * chunkSize;
      const end = Math.min(fileSize, start + chunkSize);
      const chunk = selectedFile.slice(start, end);
      const chunkData = {
        roomId: currentRoomId,
        chunkIndex,
        chunk,
      };
      socket?.emit("file-upload", chunkData);
    });
  };

  return (
    <>
      <Background position="relative">
        {isRoomJoined ? (
          <div className="container max-w-[90vw] w-[450px]  flex flex-col  items-center gap-4 select-none">
            <StyleSheetManager
              shouldForwardProp={(prop) => {
                return (
                  prop !== "isfocused" &&
                  prop !== "isdragaccept" &&
                  prop !== "isdragreject" &&
                  prop !== "selectedfilename"
                );
                // return true;
              }}
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
                  <CustomButton
                    type="submit"
                    className="w-[150px] bg-red-600 hover:bg-red-400 hover:text-gray-900"
                  >
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
        ) : (
          <form
            onSubmit={form.handleSubmit(joinRoomHandler)}
            className="z-1000"
          >
            <CustomButton
              disabled={!isConnected}
              type="submit"
              className="w-[150px] h-[60px] flex justify-center items-center gap-4"
            >
              Connect
              <MdLinkOff />
            </CustomButton>
          </form>
        )}
      </Background>
      <ToastContainer />
    </>
  );
}
