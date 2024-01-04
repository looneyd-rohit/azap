"use client";
import CustomButton from "@/components/ui/CustomButton";
import Background from "@/components/ui/wrapper";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { Torrent } from "webtorrent";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#c4c4c4",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const getColor = (props: any) => {
  if (props.isdragaccept) {
    return "#00e676";
  }
  if (props.isdragreject) {
    return "#ff1744";
  }
  if (props.isfocused) {
    return "#2196f3";
  }
  return "#eeeeee";
};

interface ContainerProps {
  isfocused: string;
  isdragaccept: string;
  isdragreject: string;
  selectedfilename: string | null;
}

const Container = styled.div<ContainerProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out,
    box-shadow 1s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: ${(props) =>
    props.selectedfilename ? "0 0 100px rgba(33, 150, 243, 0.7)" : "none"};
`;

export default function Upload({ client }: { client: any }) {
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

  const resetFiles = () => {
    setSelectedFileName(null);
  };

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

  // @ts-ignore
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isfocused ? focusedStyle : {}),
      ...(isdragaccept ? acceptStyle : {}),
      ...(isdragreject ? rejectStyle : {}),
      boxShadow: selectedFileName
        ? "0 0 100px rgba(33, 150, 243, 0.7)"
        : "none",
      transition: "box-shadow 1s cubic-bezier(0.19, 1, 0.22, 1)",
    }),
    [isfocused, isdragaccept, isdragreject, selectedFileName]
  );

  const removeFileHandler = (e: any) => {
    setSelectedFileName(null);
  };
  const uploadFileHandler = (e: any) => {
    if (!selectedFile || !client) {
      toast.error("Some error occured. Please try again.");
      return;
    }
    console.log("uploaded...");
    console.log(selectedFile);
    client.seed(selectedFile, (torrent: Torrent) => {
      console.log("Client is seeding: ", torrent.magnetURI);
      console.log(torrent);
      console.log(torrent.magnetURI);
      // console.log(torrent.files);

      const file = torrent.files[0];

      file?.getBlob((err: any, blob: any) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(blob);
      });
    });
  };

  return (
    <>
      <Background position="relative">
        <div className="container max-w-[90vw] w-[450px]  flex flex-col  items-center gap-4 select-none">
          {/* <div
            {...getRootProps({ style })}
            className="w-full flex justify-center items-center"
        > */}
          <Container
            {...getRootProps({
              isfocused: isfocused ? "true" : "false",
              isdragaccept: isdragaccept ? "true" : "false",
              isdragreject: isdragreject ? "true" : "false",
              selectedfilename: selectedFileName,
            })}
            className="w-full flex justify-center items-center"
          >
            <input {...getInputProps()} />
            {isdragactive ? (
              <p className="w-full flex justify-center items-center">
                Drag &apos;n&apos; drop one file here, or click to select a file
              </p>
            ) : selectedFileName ? (
              <p className="w-full flex justify-center items-center">
                Selected: {selectedFileName}
              </p>
            ) : (
              <p className="w-full flex justify-center items-center">
                Drag &apos;n&apos; drop one file here, or click to select a file
              </p>
            )}
          </Container>
          {/* </div> */}
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
