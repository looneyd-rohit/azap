"use client";
import { useSocket } from "@/app/components/providers/socket-provider";
import CustomButton from "@/components/ui/CustomButton";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";

const Download = () => {
  const form = useForm();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [receivedChunks, setReceivedChunks] = useState<any>([]);
  const [completedFiles, setCompletedFiles] = useState<any>([]);
  const [downloadLink, setDownloadLink] = useState<string>("");

  // get search params
  const searchParams = useSearchParams();

  const roomId = searchParams?.get("roomId");

  // get socket
  const { socket } = useSocket();

  const receivedChunkHandler = (data: any) => {
    console.log("download-chunk event received");
    console.log(data);
    const { fileName, index, fileSize, data: chunk, isLastChunk } = data;

    setReceivedChunks((prevChunks: any) => [...prevChunks, chunk]);

    if (isLastChunk) {
      const reconstructedFile = new Blob(receivedChunks, {
        type: "application/octet-stream",
      });

      saveAs(reconstructedFile, fileName);

      setDownloadLink(URL.createObjectURL(reconstructedFile));
      setCompletedFiles((prevFiles: any) => [...prevFiles, fileName]);
      setReceivedChunks([]);
    }
  };

  // join the particular room first
  // then emit a download event
  useEffect(() => {
    if (roomId && socket) {
      socket?.emit("join-room", { roomId });
    }

    if (socket) {
      socket.on("download-chunk", receivedChunkHandler);
    }

    // cleanup
    return () => {
      socket?.disconnect();
      socket?.off("download-chunk", receivedChunkHandler);
    };
  }, [roomId, socket]);

  const downloadHandler = () => {
    if (!socket || isDownloading || !roomId) return;
    console.log("Download initiated...");
    // emit event to host to upload the file
    socket?.emit("file-download", { roomId });
  };
  return (
    <div>
      <form onSubmit={form.handleSubmit(downloadHandler)} className="z-1000">
        <CustomButton
          disabled={isDownloading}
          type="submit"
          className="w-[150px] h-[60px] flex justify-center items-center gap-4"
        >
          Download
        </CustomButton>
      </form>
      <div>Completed files: {completedFiles.join(", ")}</div>
      <div>Download Link: {downloadLink}</div>
      <ToastContainer />
    </div>
  );
};

export default Download;
