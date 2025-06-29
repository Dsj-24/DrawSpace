"use client"
import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {

const [RoomID,setRoomID] = useState("");
const router = useRouter();
  return (
    <>
      <div style={{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        height:"100vh",
        width:"100vw"
      }}>
        <div> 
          <input style={{padding:10}} type="text" placeholder="Room Id"  onChange={(e)=>{
      setRoomID(e.target.value);
        }}></input>
        <button style={{padding:10}} onClick={()=>{
        router.push(`/room/${RoomID}`)
        }}>Join Room</button>
        </div>
      
      </div>
    </>
  );
}
