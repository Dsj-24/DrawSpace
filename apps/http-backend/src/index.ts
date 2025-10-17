import express from 'express'
import cors from 'cors'
import { AuthMiddleware } from './middleware';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';



const app = express();


app.use(cors());
app.use(express.json());


app.post("/signup", async (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            message: "Invalid Inputs",
        })
        return
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: req.body.username,
                password: req.body.password,
                name: req.body.name
            }

        })

        res.json({
            message: "User Created!",
            id: user.id
        })
    }
    catch (e) {
        res.json({
            message: "User Already exists!",
            error: e
        })
    }

})

app.post("/signin", async (req, res) => {
    const data = SignInSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            message: "Invalid Inputs",
        })
    }

    const result = await prismaClient.user.findFirst({
        where: {
            email: req.body.username,
            password: req.body.password
        }
    })
    console.log(JWT_SECRET);

    //@ts-ignore
    if (result) {
        const userId = result.id;
        const token = jwt.sign({ userId }, JWT_SECRET);
        res.json({
            Token: token
        })
        return
    }
    else {
        res.status(401).json({
            message: "User not found!"
        })
    }
    return
})



app.post("/room", AuthMiddleware, async (req: Request, res: Response) => {
    console.log("Received body:", req.body); 
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(401).json({
            message: "ZOD :__ Invalid Inputs",
        })
        return
    }

    try{
            //@ts-ignore
    const userId = req.userId;
    const newRoom = await prismaClient.room.create({
        data: {

            slug: req.body.slug,
            adminId: userId
        }
    })

    res.json({
        id: newRoom.id,
    })
    } catch(e){
    res.status(401).json({
        message:"Room Name already exists"
    })
    }

})

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            include: {
                user: {
                    select: { name: true }
                }
            },
            take: 50
        });
        

        res.json({
            messages,
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})

app.get("/users/:roomId", async (req: Request, res: Response) => {
  const roomId = Number(req.params.roomId);

  const users = await prismaClient.user.findMany({
    where: { rooms: { some: { id: roomId } } },
    select: { id: true, name: true }
  });

  res.json(users);
});

app.get("/rooms/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const room =  await prismaClient.room.findFirst({
        where: { id: roomId }
    });

    res.json({
        room
    });
});

app.listen(3001);