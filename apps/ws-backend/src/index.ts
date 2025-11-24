import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }

}

wss.on('connection', function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })

  ws.on('message', async function message(data) {
    let parsedData: { type: string; roomId: string; room: string; message: any; clientMsgId: any; shapeId: any; shape: any; };
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room);
    }

    console.log("message received")
    console.log(parsedData);
    // ws-server.ts
    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const clientMsgId = parsedData.clientMsgId;   // <— carry through

      const chat = await prismaClient.chat.create({
        data: { roomId: Number(roomId), message, userId }
      });

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            id: chat.id,           // <— the DB id
            roomId,
            message,               // unchanged
            clientMsgId            // <— echo back
          }));
        }
      });
    }

    if (parsedData.type === "delete") {
      const roomId = parsedData.roomId;         // same type you use for join_room
      const shapeId = Number(parsedData.shapeId);
      users.forEach(u => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(JSON.stringify({
            type: "delete",
            roomId,
            shapeId
          }));
        }
      });
    }

if (parsedData.type === "update") {
  const roomId = parsedData.roomId;
  const shapeId = Number(parsedData.shapeId);
  const shape   = parsedData.shape;

  // Optional alternative (do DB update via WS instead of REST):
  // await prismaClient.chat.updateMany({ where: { id: shapeId, roomId: Number(roomId) }, data: { message: JSON.stringify({ shape }) } });

  users.forEach(u => {
    if (u.rooms.includes(roomId)) {
      u.ws.send(JSON.stringify({
        type: "update",
        roomId,
        shapeId,
        shape
      }));
    }
  });
}



    if (parsedData.type === "join_room" || parsedData.type === "leave_room") {
      const roomId = parsedData.roomId;

      // 1. figure out which userIds are now in this room
      const memberIds = users
        .filter(u => u.rooms.includes(roomId))
        .map(u => u.userId);

      // 2. fetch their names from your users table
      const members: { id: string; name: string }[] =
        await prismaClient.user.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, name: true },
        });

      // 3. push the updated list to everyone in that room
      users.forEach(u => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "room_users",
              users: members,
            })
          );
        }
      });
    }

  });

});

