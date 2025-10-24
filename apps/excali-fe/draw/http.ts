import { BACKEND_URL } from "@repo/backend-common/config";
import axios from "axios";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "triangle"; x: number; y: number; width: number; height: number }
  | { type: "pencil"; points: { x: number; y: number }[] };

export type ShapeRow = { id: number; shape: Shape };

export async function getExistingShapes(roomId: string): Promise<ShapeRow[]> {
  const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
  const messages: Array<{ id: number; message: string }> = res.data.messages ?? [];

  return messages
    .map((m) => {
      try {
        const parsed = JSON.parse(m.message);         // <- parses {"shape":{...}}
        if (parsed && parsed.shape && parsed.shape.type) {
          return { id: m.id, shape: parsed.shape as Shape };  // <- keep DB id + shape
        }
      } catch {}
      return null;
    })
    .filter(Boolean) as ShapeRow[];
}

export async function deleteShape(roomId: string, shapeId: string) {
    await axios.delete(`${BACKEND_URL}/shapes/${roomId}/${shapeId}`);
}

export async function updateShape(roomId: string, shapeId: string, shape: any) {
  await axios.put(`${BACKEND_URL}/shapes/${roomId}/${shapeId}`, { shape });
}
