"use client"

import { initDraw } from "../draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, PenTool, RectangleHorizontalIcon, TriangleIcon, TypeIcon } from "lucide-react";
import { Game } from "../draw/Game";
import axios from "axios";
import { prismaClient } from '@repo/db/client';
import { BACKEND_URL } from "@repo/backend-common/config";

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
    const [roomName, setRoomName] = useState<string>("");
    const [logs, setLogs] = useState<{ userName: string; shapeType: string }[]>([]);
    const [roomUsers, setRoomUsers] = useState<{ id: string; name: string }[]>([]);

useEffect(() => {
    socket.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "room_users") {
        setRoomUsers(msg.users);
      }
      // … handle chat / other types …
    });
  }, [socket]);

    // Initial logs fetch (history) on room change
    useEffect(() => {
      getUserLogs(roomId).then(setLogs).catch(console.error);
    });

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    // Game init / teardown
    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
            return () => { g.destroy(); }
        }
    }, [canvasRef]); // keep ref stable; re-init when room/socket changes

    // Fetch leader + room name
    useEffect(() => {
      const fetchRoomUsers = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/users/${roomId}`);
          const users = res.data;
          console.log('API users response:', users);
          if (users && users.length > 0) {
            setRoomLeader(users[0]);
            console.log('Set leader:', users[0]);
          } else {
            setRoomLeader(null);
          }
        } catch (error) {
          console.error("Failed to fetch users", error);
        }
      };

      const fetchRoomName = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/rooms/${roomId}`);
          // Hardened: accept {slug|name} at root OR {room: {slug|name}}
          const data = res.data ?? {};
          const rootName = data.slug || data.name;
          const nested = data.room ?? {};
          const nestedName = nested.slug || nested.name;

          const finalName = rootName || nestedName || "Room";
          setRoomName(finalName);
        } catch (error) {
          console.error("Failed to fetch room name", error);
          setRoomName("Room");
        }
      };

      fetchRoomUsers();
      fetchRoomName();
    }, [roomId]);

    return <div style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#1a1f2e"
    }}>
        <canvas 
          ref={canvasRef} 
          width={window.innerWidth} 
          height={window.innerHeight}
          style={{ backgroundColor: "#2d3442" }}
        ></canvas>
        
        {/* LEFT SIDEBAR */}
        <div
          style={{
            position: "fixed",
            top: 10,
            left: 10,
            width: "300px",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            gap: 0,
            zIndex: 30
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "16px",
              borderRadius: "12px",
              color: "#fff",
              backdropFilter: "blur(10px)",
              marginBottom: "12px"
            }}
          >
            <nav style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ 
                width: "44px", 
                height: "44px", 
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)", 
                borderRadius: "10px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(99, 102, 241, 0.3)"
              }}>
                <PenTool style={{ width: "24px", height: "24px", color: "white" }} />
              </div>
              <span style={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                DrawSpace
              </span>
            </nav>

            {/* Tools */}
            <div style={{ display: "flex", gap: "8px" }}>
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
          </div>

          {/* Room Info Card */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "16px",
              borderRadius: "12px",
              color: "#fff",
              backdropFilter: "blur(10px)",
              marginBottom: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "50%" }}></div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Room
              </span>
            </div>
            
            <div style={{ marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Room Name</span>
              <h2 style={{ 
                margin: 0, 
                fontSize: "20px", 
                fontWeight: "bold", 
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "capitalize"
              }}>
                {roomName}
              </h2>
            </div>

            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(99, 102, 241, 0.2)" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Creator</span>
              <div style={{ fontSize: "14px", fontWeight: "500", color: "#e0e7ff" }}>
                {roomLeader ? `• ${roomLeader.name}` : "Loading..."}
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              padding: "16px",
              borderRadius: "12px",
              color: "#fff",
              backdropFilter: "blur(10px)",
              marginBottom: 0
            }}
          >
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Users In Room ({roomUsers.length})
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {roomUsers.length > 0 ? (
                roomUsers.map((u) => (
                  <li 
                    key={u.id} 
                    style={{ 
                      padding: "8px 0", 
                      fontSize: "13px",
                      color: "#e0e7ff",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%" }}></span>
                    {u.name}
                  </li>
                ))
              ) : (
                <li style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "13px" }}>No users yet…</li>
              )}
            </ul>
          </div>

          {/* BOTTOM CARD: Activity Logs with Fixed Header */}
          <div
            style={{
              marginTop: "12px",
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "12px",
              color: "#fff",
              backdropFilter: "blur(10px)",
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Fixed Header */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid rgba(99, 102, 241, 0.2)",
                flex: "0 0 auto"
              }}
            >
              <h3 style={{ 
                margin: 0,
                fontSize: "12px",
                fontWeight: "600",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Activity Logs
              </h3>
            </div>

            {/* Scrollable Content */}
            <ul style={{ 
              listStyle: "none", 
              padding: "16px", 
              margin: 0,
              overflowY: "auto",
              flex: "1 1 auto"
            }}>
              {logs.length > 0
                ? logs.map((l, i) => (
                    <li 
                      key={i} 
                      style={{ 
                        marginBottom: "10px",
                        padding: "10px",
                        backgroundColor: "rgba(99, 102, 241, 0.05)",
                        borderLeft: "3px solid #6366f1",
                        borderRadius: "4px",
                        fontSize: "12px",
                        lineHeight: "1.5"
                      }}
                    >
                      <strong style={{ color: "#a78bfa" }}>{l.userName}</strong>
                      <br />
                      <span style={{ color: "#cbd5e1" }}>drew a <em style={{ color: "#60a5fa", fontStyle: "italic" }}>{l.shapeType}</em></span>
                    </li>
                  ))
                : <li style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "12px" }}>No shapes drawn yet…</li>
              }
            </ul>
          </div>
        </div>
    </div>
}

export async function getUserLogs(roomId: string) {
  const { data } = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  // data.messages: Array< { message: string; user: { name: string } } >
  
  return data.messages.map((m: any) => {
    const parsed = JSON.parse(m.message);
    return {
      userName: m.user.name,
      shapeType: parsed.shape.type
    };
  });
}
