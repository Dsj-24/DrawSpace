import {z} from 'zod'

export const CreateUserSchema = z.object({
    username: z.string().max(20).min(4),
    password: z.string().min(6).max(20),
    name: z.string()
})

export const SignInSchema = z.object({
    username: z.string().max(20).min(4),
    password: z.string().min(6).max(20),
})


export const CreateRoomSchema = z.object({
    slug:z.string().min(3).max(20),
})