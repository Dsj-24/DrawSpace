"use client";

import { WS_URL } from "@repo/backend-common/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function RoomCanvas({roomId}: {roomId: string}){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const router = useRouter();


    useEffect(() => {
        const token = localStorage.getItem("token"); 
    if (!token) {
      console.log("No auth token found – make sure you’re logged in!");
      router.push("/signin");
      return;
    }
        const ws = new WebSocket(`${WS_URL}?token=${token}`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}