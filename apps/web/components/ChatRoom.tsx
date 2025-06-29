import { BACKEND_URL } from "@repo/backend-common/config";
import axios from "axios";
import { ChatClient } from "./ChatClient";

async function getChats(roomId: string) {
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return response.data.messages;

}

export async function ChatRoom({ id }: {
    id: string
}) {
    const messages = await getChats(id);

    return <ChatClient id={id} messages={messages}></ChatClient>
}