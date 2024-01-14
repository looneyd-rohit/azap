"use client";
import CustomButton from "@/components/ui/CustomButton";
import Background from "@/components/ui/wrapper";
import React, {
  Fragment,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import { set, useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StyleSheetManager } from "styled-components";
import UploadContainerComponent from "@/app/components/UploadContainerComponent";
import { useSocket } from "@/app/components/providers/socket-provider";
import { createId } from "@/config/cuid";
import { MdLinkOff } from "react-icons/md";
import "react-toastify/dist/ReactToastify.css";
import { GetNewWorkerInstance } from "@/lib/utils";
import SimplePeer from "simple-peer";
import { redirect, useSearchParams } from "next/navigation";
import { SocketIndicator } from "@/app/components/socket-indicator";
import { PeerIndicator } from "@/app/components/peer-indicator";
import { IoMdCopy } from "react-icons/io";
import { useCopyToClipboard } from "usehooks-ts";
import ProgressBar from "@ramonak/react-progress-bar";

type PayloadType = {
  target: string;
  callerID: string;
  signal: SimplePeer.SignalData;
};

export default function Download() {
  const form = useForm();
  const searchParams = useSearchParams();
  const roomId = searchParams?.get("roomId");

  const { socket, isConnected } = useSocket();

  const [value, copyValueToClipboard] = useCopyToClipboard();

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isPeerConnected, setIsPeerConnected] = useState<boolean>(false);
  const [isReceivedFile, setIsReceivedFile] = useState<boolean>(false);

  const [receivedProgress, setReceivedProgress] = useState<number | null>(null);
  const [sentProgress, setSentProgress] = useState<number | null>(null);

  const receivedFileRef: MutableRefObject<string | null> = useRef(null);
  const workerRef: MutableRefObject<Worker | undefined> = useRef();
  const peerRef: MutableRefObject<SimplePeer.Instance | undefined> = useRef();

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    if (acceptedFiles.length !== 1) {
      toast.error("Please select only one file.");
      return;
    }

    const file = acceptedFiles[0];

    if (file.size > 5 * 1024 * 1024 * 1024) {
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
    setSelectedFile(null);
    setReceivedProgress(null);
  };

  const uploadFileHandler = (e: any) => {
    if (!selectedFileName || !selectedFile || !isConnected || !socket) {
      toast.error("Some error occured. Please try again.");
      return;
    }
    console.log("uploaded...");
    console.log(selectedFile);
  };

  // join a new room as and when the page loads up
  useEffect(() => {
    if (!socket) return;
    if (!roomId) {
      toast.error("Please provide a room id");
      redirect("/");
      return;
    }
    // instantiate worker thread
    workerRef.current = GetNewWorkerInstance();
    console.log("workerref: ", workerRef.current);

    // join a new room on page load
    const randomRoomId = roomId;
    setCurrentRoomId(randomRoomId);
    socket?.emit("join-room", randomRoomId);
    socket?.on("user-connected", (userId: string) => {
      peerRef.current = createPeer(userId, socket?.id);
      toast.success("Peer connected");
    });

    // set up peers
    socket?.on("user-joined", (payload: PayloadType) => {
      console.log("user-joined: ", payload);
      peerRef.current = addPeer(payload.signal, payload.callerID);
    });

    socket?.on("receiving-returned-signal", (payload: PayloadType) => {
      console.log("Peer1-Return-signal-added", payload.signal);
      peerRef.current?.signal(payload.signal);
      setIsPeerConnected(true);
    });

    socket?.on("peer-disconnect", (msg: string) => {
      setIsPeerConnected(false);
      toast.error(msg);
    });

    socket?.on("received-progress", (progress: number) => {
      console.log("receive-progress: ", progress);
      setReceivedProgress(progress);
    });

    return () => {
      socket?.disconnect();
      setSelectedFileName(null);
      setSelectedFile(null);
      setCurrentRoomId(null);
    };
  }, [socket]);

  function createPeer(target: string, callerID: string) {
    console.log("Peer1-Created");
    const peer = new SimplePeer({
      initiator: true,
      objectMode: true,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
      trickle: false,
    });

    console.log("created-peer: ", peer);

    peer.on("signal", (signal: SimplePeer.SignalData) => {
      socket?.emit("sending-signal", {
        target,
        callerID,
        signal,
      });
    });

    peer.on("data", handleReceivingData);

    return peer;
  }

  function addPeer(incomingSignal: SimplePeer.SignalData, callerID: string) {
    console.log("Peer2-Added");

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    peer.on("signal", (signal: SimplePeer.SignalData) => {
      socket?.emit("returning-signal", {
        signal,
        target: callerID,
      });
    });

    peer.on("data", handleReceivingData);

    console.log("Peer2-Signal-Added", incomingSignal);
    peer.signal(incomingSignal);
    setIsPeerConnected(true);
    toast.success("Peer connected");
    return peer;
  }

  function handleReceivingData(data: any) {
    console.log("Data-incoming: ", data);
    const worker = workerRef.current;

    if (data.toString().includes("done")) {
      console.log("Data-received");
      setIsReceivedFile(true);
      const parsed = JSON.parse(data.toString());
      receivedFileRef.current = parsed.fileName;
    } else {
      worker?.postMessage(data);
    }
  }

  const downloadHandler = () => {
    setIsReceivedFile(false);
    setReceivedProgress(null);
    const worker = workerRef.current;
    worker?.postMessage("download");
    worker?.addEventListener("message", (event) => {
      const link = document.createElement("a");
      link.href = event.data;
      link.download = receivedFileRef.current as string;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(event.data);
    });
  };
  const selectFileHandler = (e: any) => {
    setSelectedFile(e.target.files[0]);
  };

  const sendFileHandler = () => {
    const CHUNK_SIZE = 16384; // 16KB;
    const peer = peerRef.current;
    handleReading();
    function handleReading() {
      const fileReader = new FileReader();
      let offset = 0;
      console.log("offset at start: ", offset);
      let progressTillNow = 0;
      const totalChunks = Math.ceil(selectedFile?.size! / CHUNK_SIZE);

      fileReader.addEventListener("load", (event) => {
        if (
          event &&
          event.target &&
          event.target.result &&
          event.target.result instanceof ArrayBuffer
        ) {
          const arrayBuffer = event.target.result;
          const chunkBuffer = Buffer.from(arrayBuffer);

          peer?.write(chunkBuffer);

          let newProgressTillNow = Math.ceil(
            ((offset / CHUNK_SIZE + 1) / totalChunks) * 100
          );

          if (newProgressTillNow > progressTillNow + 5) {
            progressTillNow = newProgressTillNow;
            console.log("progress: ", progressTillNow);
            socket?.emit(
              "sent-progress",
              Math.ceil(((offset / CHUNK_SIZE + 1) / totalChunks) * 100)
            );
            setSentProgress(progressTillNow);
          }

          offset += event.target.result.byteLength;

          console.log("offset: ", offset);

          if (offset < selectedFile?.size!) {
            readSliceBlob(offset);
          } else {
            console.log("Data-sent");
            peer?.write(
              JSON.stringify({ done: true, fileName: selectedFile?.name })
            );
            socket?.emit("sent-progress", 100);
            setSentProgress(100);
          }
        }
      });
      readSliceBlob(0);

      function readSliceBlob(offset: number) {
        const slicedBlob = selectedFile?.slice(offset, offset + CHUNK_SIZE);
        fileReader.readAsArrayBuffer(slicedBlob!);
      }
    }
  };

  return (
    <>
      <div className="absolute right-[15px] top-[15px] sm:right-[25px] sm:top-[25px] ml-auto flex items-center">
        <SocketIndicator />
      </div>
      <Background position="relative">
        <Fragment>
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
              <UploadContainerComponent
                getRootProps={getRootProps}
                isfocused={isfocused}
                isdragaccept={isdragaccept}
                isdragreject={isdragreject}
                selectedfilename={selectedFileName}
                getInputProps={getInputProps}
                isdisabled={!isPeerConnected}
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
                    className="w-[150px] bg-orange-600 hover:bg-orange-400 hover:text-gray-900"
                  >
                    Remove File
                  </CustomButton>
                </form>
              )}
              {selectedFileName && (
                <form
                  onSubmit={form.handleSubmit(sendFileHandler)}
                  className="z-1000"
                >
                  <CustomButton
                    disabled={!isPeerConnected}
                    type="submit"
                    className="w-[150px]"
                  >
                    Upload
                  </CustomButton>
                </form>
              )}
            </div>
          </div>

          {currentRoomId && (
            <div className="w-fit relative cursor-copy">
              <div className="w-fit h-[30px] flex justify-center items-center bg-zinc-600 text-white border-none rounded-[16px] mt-4 mb-6">
                <span className="font-bold">
                  &nbsp;&nbsp;&nbsp;
                  {`{ Share Connection
                  String }`}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>
              <button
                onClick={() => {
                  copyValueToClipboard(
                    `${process.env.NEXT_PUBLIC_SITE_URL}/share/c?roomId=${currentRoomId}`
                  );
                  toast.success("Copied to clipboard");
                }}
                className="absolute right-2 top-[20px] cursor-pointer"
              >
                <IoMdCopy className="text-gray-200 hover:text-gray-400 active:text-gray-300 text-xl" />
              </button>
            </div>
          )}

          {/* peer indicator */}
          <PeerIndicator isPeerConnected={isPeerConnected} />

          {/* received progress */}
          {receivedProgress && (
            <div className="w-full flex justify-center items-center">
              <ProgressBar
                className="m-4 w-[250px]"
                completed={receivedProgress || 0}
              />
            </div>
          )}

          {/* sent progress */}
          {sentProgress && (
            <div className="w-full flex justify-center items-center">
              <ProgressBar
                className="m-4 w-[250px]"
                completed={sentProgress || 0}
              />
            </div>
          )}

          {/* received file information */}
          {isReceivedFile && (
            <>
              <div className="w-fit h-[30px] flex justify-center items-center bg-zinc-600 text-white border-none rounded-[16px] mt-4 mb-6">
                <span className="font-semibold">
                  &nbsp;&nbsp;File Received :{" "}
                </span>
                &nbsp;
                <span className="font-bold text-zinc-100">
                  {/* {`${receivedFileRef.current?.split(".")[0].slice(0, 50)}.${
                    receivedFileRef.current?.split(".")[1]
                  }`} */}
                  {receivedFileRef.current}
                  &nbsp;&nbsp;
                </span>
              </div>

              {/* <button onClick={downloadHandler}>Download</button> */}
              <form
                onSubmit={form.handleSubmit(downloadHandler)}
                className="z-1000"
              >
                <CustomButton
                  disabled={!isPeerConnected}
                  type="submit"
                  className="w-[150px]"
                >
                  Download
                </CustomButton>
              </form>
            </>
          )}
        </Fragment>
      </Background>
      {
        // <main>
        //   <div>
        //     <input onChange={selectFileHandler} type="file" />
        //     <button onClick={sendFileHandler}>Send File</button>
        //   </div>
        //   {currentRoomId && (
        //     <div>
        //       Join using:{" "}
        //       {`http://localhost:3000/share/download?roomId=${currentRoomId}`}
        //     </div>
        //   )}
        //   {isPeerConnected ? `Connected...` : `Not Connected...`}
        //   {isReceivedFile && (
        //     <>
        //       {receivedFileRef.current}
        //       <button onClick={downloadHandler}>Download</button>
        //     </>
        //   )}
        // </main>
      }
      <ToastContainer />
    </>
  );
}
