"use client";

import CustomButton from "@/components/ui/CustomButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState, useEffect } from "react";
import Upload from "./components/Upload";
import WebTorrent from "webtorrent";
// const WebTorrent = require("../../../public/webtorrent.min.js");

const Torrent = () => {
  const [client, setClient] = useState<WebTorrent.Instance | null>(null);
  useEffect(() => {
    window.global ||= window;
    setClient(
      new WebTorrent({
        tracker: {
          rtcConfig: {
            iceServers: [
              {
                urls: "stun:stun.l.google.com:19302",
              },
              {
                urls: "stun:global.stun.twilio.com:3478?transport=udp",
              },
            ],
          },
        },
      })
    );

    return () => {
      // client?.destroy();
    };
  }, []);

  useEffect(() => {
    if (client) {
      client.on("error", function (err) {
        console.error("ERROR: " + err);
      });
    }
  }, [client]);

  return (
    <main>
      <Upload client={client} />
    </main>
  );
};

export default Torrent;
