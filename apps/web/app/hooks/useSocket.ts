import { useEffect, useState } from "react";
import { WS_URL } from "@repo/backend-common/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZWQ3MmMwOS01YjFkLTQ0OWItYmI1MS01YjllNTgwMGJhYmUiLCJpYXQiOjE3NDk5MjU5NTh9.mdlKDFXhEhbAMBqcFlOBC_UQ4A-XuHJqN0ix1rq-6SA`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        socket,
        loading
    }

}