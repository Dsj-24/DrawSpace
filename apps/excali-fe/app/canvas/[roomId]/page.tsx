
import { RoomCanvas } from "../../../components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;

    return (
    <RoomCanvas roomId={roomId} />

 ) 
}

export const dynamic = 'force-dynamic'; // Ensures the page is always re-rendered