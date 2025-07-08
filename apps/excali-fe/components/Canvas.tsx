"use client"

import { initDraw } from "../draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, PenTool, RectangleHorizontalIcon, TriangleIcon, TypeIcon } from "lucide-react";
import { Game } from "../draw/Game";
import axios from "axios";
import { prismaClient } from '@repo/db/client';

export type Tool = "circle" | "rect" | "pencil" | "triangle";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [roomLeader, setRoomLeader] = useState<{ id: string; name: string } | null>(null);
    const [roomUsers, setRoomUsers] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }


    }, [canvasRef]);
    
useEffect(() => {
  const fetchRoomUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/users/${roomId}`);
      const users = res.data;
      console.log('API users response:', users);
      if (users && users.length > 0) {
        setRoomLeader(users[0]); // Set leader only
        console.log('Set leader:', users[0]);
      } else {
        setRoomLeader(null);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  fetchRoomUsers();
}, [roomId]);


    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool}  roomLeader={roomLeader} roomUsers={roomUsers} />
    </div>
}


function Topbar({
  selectedTool,
  setSelectedTool,
  roomUsers,
  roomLeader
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  roomLeader: { id: string; name: string } | null;
  roomUsers: { id: string; name: string }[];
}) {
  return (
    <div style={{ position: "fixed", top: 10, left: 10 }}>
      <header className="relative z-10">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              DrawSpace
            </span>
          </div>
        </nav>
      </header>
      <div className="flex gap-2 mt-2">
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        />
        <IconButton
          onClick={() => setSelectedTool("triangle")}
          activated={selectedTool === "triangle"}
          icon={<TriangleIcon />}
        />
      </div>

      {/* ✅ Show room users here */}
      <div className="mt-4 text-white">
        <h3 className="text-lg font-semibold mb-1">Creator of The Room</h3>
        <ul className="text-md text-white ">
          {roomLeader && (
            <li key={roomLeader.id}>• {roomLeader.name}</li>
          )}
        </ul>
 
      </div>
    </div>
  );
}
    
    
    {/* <IconButton 
    onClick={() => setSelectedTool("text")}
    activated={selectedTool === "text"}
    icon={<TypeIcon />}  // you can choose any icon
/> */}