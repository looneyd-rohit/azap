"use client";

import { Badge } from "../../components/ui/badge";

export const PeerIndicator = ({
  isPeerConnected,
}: {
  isPeerConnected: boolean;
}) => {
  if (isPeerConnected) {
    return (
      <Badge
        variant="outline"
        className="w-[120px] h-[25px] flex justify-center items-center bg-emerald-600 text-white border-none"
      >
        Peer Connected
      </Badge>
    );
  } else {
    return (
      <Badge
        variant="outline"
        className="w-[120px] h-[25px] flex justify-center items-center bg-orange-600 text-white border-none"
      >
        No Peer
      </Badge>
    );
  }
};
